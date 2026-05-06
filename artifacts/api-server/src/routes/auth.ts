import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, walletsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function generateToken(userId: number): string {
  return Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64");
}

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Wallet-based auth — connect wallet → create or find account
router.post("/auth/wallet", async (req, res): Promise<void> => {
  const { walletAddress, name } = req.body;

  if (!walletAddress || typeof walletAddress !== "string") {
    res.status(400).json({ error: "walletAddress is required" });
    return;
  }

  if (!isValidSolanaAddress(walletAddress)) {
    res.status(400).json({ error: "Invalid Solana wallet address" });
    return;
  }

  // Check if user exists by wallet address
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.walletAddress, walletAddress));

  if (existing.length > 0) {
    const user = existing[0];
    const token = generateToken(user.id);
    req.log.info({ userId: user.id }, "Wallet login");
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
    });
    return;
  }

  // New wallet — require name before creating account
  if (!name || typeof name !== "string" || name.trim().length < 1) {
    res.status(202).json({ newUser: true, message: "Username required for new wallet" });
    return;
  }

  const trimmedName = name.trim().slice(0, 32);

  const [user] = await db
    .insert(usersTable)
    .values({
      name: trimmedName,
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
  req.log.info({ userId: user.id }, "New wallet user created");

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    },
  });
});

// Keep /auth/me for token validation
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
    res.json({
      id: user.id,
      name: user.name,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    });
  } catch {
    logger.warn("Invalid token");
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
