import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, walletsTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function generateToken(userId: number): string {
  return Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64");
}

function generateWalletAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "";
  for (let i = 0; i < 44; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password, userType, country } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const walletAddress = generateWalletAddress();

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password,
    userType: userType ?? "freelancer",
    country: country ?? "IN",
    walletAddress,
  }).returning();

  await db.insert(walletsTable).values({
    userId: user.id,
    address: walletAddress,
    usdgBalance: "100.00",
    inrBalance: "8350.00",
    totalReceived: "0.00",
    totalSent: "0.00",
  });

  const token = generateToken(user.id);

  req.log.info({ userId: user.id }, "User registered");
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      country: user.country,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken(user.id);

  req.log.info({ userId: user.id }, "User logged in");
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      country: user.country,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    },
  });
});

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
      email: user.email,
      userType: user.userType,
      country: user.country,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    });
  } catch {
    logger.warn("Invalid token");
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
