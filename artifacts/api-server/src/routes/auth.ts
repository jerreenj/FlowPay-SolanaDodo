import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, walletsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function generateToken(userId: number): string {
  return Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64");
}

function generateWalletAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

function userResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    walletAddress: user.walletAddress ?? "",
    createdAt: user.createdAt,
  };
}

// Email + password login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken(user.id);
  req.log.info({ userId: user.id }, "Email login");
  res.json({ token, user: userResponse(user) });
});

// Register new account
router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, userType = "freelancer", country = "IN" } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const walletAddress = generateWalletAddress();
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password, userType, country, walletAddress })
    .returning();

  await db.insert(walletsTable).values({
    userId: user.id,
    address: walletAddress,
    usdgBalance: "100.00",
    inrBalance: "0.00",
    totalReceived: "0.00",
    totalSent: "0.00",
  });

  const token = generateToken(user.id);
  req.log.info({ userId: user.id }, "New user registered");
  res.status(201).json({ token, user: userResponse(user) });
});

// Wallet-based auth — connect wallet → instantly in
router.post("/auth/wallet", async (req, res): Promise<void> => {
  const { walletAddress } = req.body;

  if (!walletAddress || typeof walletAddress !== "string") {
    res.status(400).json({ error: "walletAddress is required" });
    return;
  }

  if (!isValidSolanaAddress(walletAddress)) {
    res.status(400).json({ error: "Invalid Solana wallet address" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.walletAddress, walletAddress));

  if (existing.length > 0) {
    const user = existing[0];
    const token = generateToken(user.id);
    req.log.info({ userId: user.id }, "Wallet login");
    res.json({ token, user: userResponse(user) });
    return;
  }

  const handle = `user_${walletAddress.slice(0, 8)}`;
  const [user] = await db
    .insert(usersTable)
    .values({
      name: handle,
      email: `${walletAddress.toLowerCase()}@wallet.flowpay`,
      password: "",
      userType: "freelancer",
      country: "IN",
      walletAddress,
    })
    .returning();

  await db.insert(walletsTable).values({
    userId: user.id,
    address: walletAddress,
    usdgBalance: "0.00",
    inrBalance: "0.00",
    totalReceived: "0.00",
    totalSent: "0.00",
  });

  const token = generateToken(user.id);
  req.log.info({ userId: user.id }, "New wallet user auto-created");
  res.status(201).json({ token, user: userResponse(user) });
});

// /auth/me for token validation
router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const { userId } = JSON.parse(Buffer.from(token, "base64").toString());
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(userResponse(user));
  } catch {
    logger.warn("Invalid token");
    res.status(401).json({ error: "Invalid token" });
  }
});

// Update display name
router.patch("/auth/profile", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 1) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const { userId } = JSON.parse(Buffer.from(token, "base64").toString());
    const [user] = await db
      .update(usersTable)
      .set({ name: name.trim() })
      .where(eq(usersTable.id, userId))
      .returning();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    req.log.info({ userId }, "Profile name updated");
    res.json(userResponse(user));
  } catch {
    res.status(400).json({ error: "Invalid token" });
  }
});

export default router;
