import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, walletsTable, walletTransactionsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/wallet", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  let userId = 1;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const parsed = JSON.parse(Buffer.from(token, "base64").toString());
      userId = parsed.userId ?? 1;
    } catch { /* use default */ }
  }

  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId));

  if (!wallet) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }

  res.json({
    id: wallet.id,
    userId: wallet.userId,
    address: wallet.address,
    usdgBalance: wallet.usdgBalance,
    inrBalance: wallet.inrBalance,
    totalReceived: wallet.totalReceived,
    totalSent: wallet.totalSent,
    createdAt: wallet.createdAt,
  });
});

router.get("/wallet/transactions", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  let userId = 1;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const parsed = JSON.parse(Buffer.from(token, "base64").toString());
      userId = parsed.userId ?? 1;
    } catch { /* use default */ }
  }

  const txs = await db.select().from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId))
    .orderBy(sql`created_at DESC`)
    .limit(50);

  res.json(txs.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    currency: t.currency,
    description: t.description,
    solanaSignature: t.solanaSignature ?? null,
    createdAt: t.createdAt,
  })));
});

export default router;
