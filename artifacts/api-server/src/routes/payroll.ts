import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, payrollPaymentsTable } from "@workspace/db";
import { CreatePayrollPaymentBody, GetPayrollPaymentParams } from "@workspace/api-zod";

const router: IRouter = Router();

function generateSolanaSignature(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function calcFee(amount: string): string {
  return (parseFloat(amount) * 0.005).toFixed(4);
}

function calcInr(usdg: string): string {
  return (parseFloat(usdg) * 83.5).toFixed(2);
}

router.get("/payroll/payments", async (_req, res): Promise<void> => {
  const payments = await db.select().from(payrollPaymentsTable).orderBy(sql`created_at DESC`);
  res.json(payments.map((p) => ({
    id: p.id,
    senderName: p.senderName,
    senderCompany: p.senderCompany,
    recipientName: p.recipientName,
    recipientEmail: p.recipientEmail,
    amountUsdg: p.amountUsdg,
    feeUsdg: p.feeUsdg,
    amountInr: p.amountInr,
    status: p.status,
    solanaSignature: p.solanaSignature ?? null,
    settlementSeconds: p.settlementSeconds ? parseFloat(p.settlementSeconds) : null,
    dodoPaymentId: p.dodoPaymentId ?? null,
    createdAt: p.createdAt,
  })));
});

router.post("/payroll/payments", async (req, res): Promise<void> => {
  const parsed = CreatePayrollPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { senderName, senderCompany, recipientName, recipientEmail, amountUsdg, recipientUpiId } = parsed.data;
  const feeUsdg = calcFee(amountUsdg);
  const amountInr = calcInr(amountUsdg);
  const settlementSeconds = (1.8 + Math.random() * 1.5).toFixed(1);
  const solanaSignature = generateSolanaSignature();
  const dodoPaymentId = `dodo_${Date.now()}`;

  const [payment] = await db.insert(payrollPaymentsTable).values({
    senderName,
    senderCompany,
    recipientName,
    recipientEmail,
    recipientUpiId: recipientUpiId ?? null,
    amountUsdg,
    feeUsdg,
    amountInr,
    status: "completed",
    solanaSignature,
    settlementSeconds,
    dodoPaymentId,
  }).returning();

  res.status(201).json({
    id: payment.id,
    senderName: payment.senderName,
    senderCompany: payment.senderCompany,
    recipientName: payment.recipientName,
    recipientEmail: payment.recipientEmail,
    amountUsdg: payment.amountUsdg,
    feeUsdg: payment.feeUsdg,
    amountInr: payment.amountInr,
    status: payment.status,
    solanaSignature: payment.solanaSignature ?? null,
    settlementSeconds: payment.settlementSeconds ? parseFloat(payment.settlementSeconds) : null,
    dodoPaymentId: payment.dodoPaymentId ?? null,
    createdAt: payment.createdAt,
  });
});

router.get("/payroll/payments/:id", async (req, res): Promise<void> => {
  const params = GetPayrollPaymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [payment] = await db.select().from(payrollPaymentsTable).where(eq(payrollPaymentsTable.id, params.data.id));
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  res.json({
    id: payment.id,
    senderName: payment.senderName,
    senderCompany: payment.senderCompany,
    recipientName: payment.recipientName,
    recipientEmail: payment.recipientEmail,
    amountUsdg: payment.amountUsdg,
    feeUsdg: payment.feeUsdg,
    amountInr: payment.amountInr,
    status: payment.status,
    solanaSignature: payment.solanaSignature ?? null,
    settlementSeconds: payment.settlementSeconds ? parseFloat(payment.settlementSeconds) : null,
    dodoPaymentId: payment.dodoPaymentId ?? null,
    createdAt: payment.createdAt,
  });
});

router.get("/payroll/stats", async (_req, res): Promise<void> => {
  const [row] = await db.select({
    total: count(),
    volume: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
    fees: sql<string>`COALESCE(SUM(CAST(fee_usdg AS NUMERIC)), 0)::text`,
    completed: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`,
    pending: sql<number>`COUNT(*) FILTER (WHERE status = 'pending' OR status = 'processing')`,
  }).from(payrollPaymentsTable);

  res.json({
    totalPayments: row?.total ?? 0,
    totalVolume: row?.volume ?? "0.00",
    totalFees: row?.fees ?? "0.00",
    avgSettlementSeconds: 2.3,
    completedCount: Number(row?.completed ?? 0),
    pendingCount: Number(row?.pending ?? 0),
  });
});

export default router;
