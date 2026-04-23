import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, remittancesTable } from "@workspace/db";
import { CreateRemittanceBody, GetRemittanceParams } from "@workspace/api-zod";

const router: IRouter = Router();

function generateSolanaSignature(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function calcFee(amount: string): string {
  return (parseFloat(amount) * 0.0075).toFixed(4);
}

function calcInr(usdg: string): string {
  return (parseFloat(usdg) * 83.5).toFixed(2);
}

router.get("/remittances", async (_req, res): Promise<void> => {
  const rows = await db.select().from(remittancesTable).orderBy(sql`created_at DESC`);
  res.json(rows.map((r) => ({
    id: r.id,
    senderName: r.senderName,
    senderCountry: r.senderCountry,
    recipientName: r.recipientName,
    recipientUpiId: r.recipientUpiId,
    amountUsdg: r.amountUsdg,
    feeUsdg: r.feeUsdg,
    amountInr: r.amountInr,
    status: r.status,
    solanaSignature: r.solanaSignature ?? null,
    settlementSeconds: r.settlementSeconds ? parseFloat(r.settlementSeconds) : null,
    dodoPaymentId: r.dodoPaymentId ?? null,
    createdAt: r.createdAt,
  })));
});

router.post("/remittances", async (req, res): Promise<void> => {
  const parsed = CreateRemittanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { senderName, senderCountry, recipientName, recipientUpiId, amountUsdg } = parsed.data;
  const feeUsdg = calcFee(amountUsdg);
  const amountInr = calcInr(amountUsdg);
  const settlementSeconds = (1.2 + Math.random() * 2).toFixed(1);
  const solanaSignature = generateSolanaSignature();
  const dodoPaymentId = `dodo_${Date.now()}`;

  const [row] = await db.insert(remittancesTable).values({
    senderName,
    senderCountry,
    recipientName,
    recipientUpiId,
    amountUsdg,
    feeUsdg,
    amountInr,
    status: "completed",
    solanaSignature,
    settlementSeconds,
    dodoPaymentId,
  }).returning();

  res.status(201).json({
    id: row.id,
    senderName: row.senderName,
    senderCountry: row.senderCountry,
    recipientName: row.recipientName,
    recipientUpiId: row.recipientUpiId,
    amountUsdg: row.amountUsdg,
    feeUsdg: row.feeUsdg,
    amountInr: row.amountInr,
    status: row.status,
    solanaSignature: row.solanaSignature ?? null,
    settlementSeconds: row.settlementSeconds ? parseFloat(row.settlementSeconds) : null,
    dodoPaymentId: row.dodoPaymentId ?? null,
    createdAt: row.createdAt,
  });
});

router.get("/remittances/stats", async (_req, res): Promise<void> => {
  const [row] = await db.select({
    total: count(),
    volume: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
    fees: sql<string>`COALESCE(SUM(CAST(fee_usdg AS NUMERIC)), 0)::text`,
  }).from(remittancesTable);

  const corridorRows = await db.select({
    country: remittancesTable.senderCountry,
    cnt: count(),
    vol: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
  }).from(remittancesTable).groupBy(remittancesTable.senderCountry);

  res.json({
    totalRemittances: row?.total ?? 0,
    totalVolume: row?.volume ?? "0.00",
    totalFees: row?.fees ?? "0.00",
    avgSettlementSeconds: 1.9,
    corridors: corridorRows.map((c) => ({ country: c.country, count: Number(c.cnt), volume: c.vol })),
  });
});

router.get("/remittances/:id", async (req, res): Promise<void> => {
  const params = GetRemittanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(remittancesTable).where(eq(remittancesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Remittance not found" });
    return;
  }

  res.json({
    id: row.id,
    senderName: row.senderName,
    senderCountry: row.senderCountry,
    recipientName: row.recipientName,
    recipientUpiId: row.recipientUpiId,
    amountUsdg: row.amountUsdg,
    feeUsdg: row.feeUsdg,
    amountInr: row.amountInr,
    status: row.status,
    solanaSignature: row.solanaSignature ?? null,
    settlementSeconds: row.settlementSeconds ? parseFloat(row.settlementSeconds) : null,
    dodoPaymentId: row.dodoPaymentId ?? null,
    createdAt: row.createdAt,
  });
});

export default router;
