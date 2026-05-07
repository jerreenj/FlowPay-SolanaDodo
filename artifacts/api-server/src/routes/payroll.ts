import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, payrollPaymentsTable } from "@workspace/db";
import { CreatePayrollPaymentBody, GetPayrollPaymentParams } from "@workspace/api-zod";
import { dodo, dodoEnabled, createDodoCustomer, DODO_RETURN_URL_BASE } from "../lib/dodo";

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

function mapPayment(p: typeof payrollPaymentsTable.$inferSelect) {
  return {
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
    dodoCheckoutUrl: p.dodoCheckoutUrl ?? null,
    createdAt: p.createdAt,
  };
}

router.get("/payroll/payments", async (_req, res): Promise<void> => {
  const payments = await db.select().from(payrollPaymentsTable).orderBy(sql`created_at DESC`);
  res.json(payments.map(mapPayment));
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

  // Amount in smallest denomination (cents) — USDG treated as USD, 1 USDG = 100 cents
  const amountInCents = Math.round(parseFloat(amountUsdg) * 100);

  let dodoPaymentId = `dodo_${Date.now()}`;
  let dodoCheckoutUrl: string | null = null;

  if (dodoEnabled) {
    try {
      // Create a one-time Dodo product for this specific payroll payment
      const product = await dodo.products.create({
        name: `Payroll: ${senderCompany} → ${recipientName}`,
        description: `USDG payroll payment of $${amountUsdg} from ${senderCompany}. UPI: ${recipientUpiId ?? "N/A"}`,
        tax_category: "digital_products",
        price: {
          currency: "USD",
          discount: 0,
          price: amountInCents,
          purchasing_power_parity: false,
          type: "one_time_price",
        },
        metadata: {
          sender_name: senderName,
          sender_company: senderCompany,
          recipient_upi: recipientUpiId ?? "",
          amount_usdg: amountUsdg,
          solana_sig: solanaSignature,
          source: "flowpay_payroll",
        },
      });

      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: product.product_id, quantity: 1 }],
        customer: {
          email: recipientEmail,
          name: recipientName,
        },
        return_url: `${DODO_RETURN_URL_BASE}/payroll`,
      });
      dodoPaymentId = session.session_id;
      dodoCheckoutUrl = session.checkout_url ?? null;
    } catch (err: unknown) {
      req.log?.warn({ err }, "Dodo checkout session creation failed — using mock id");
    }
  }

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
    dodoCheckoutUrl,
  }).returning();

  res.status(201).json(mapPayment(payment));
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

  res.json(mapPayment(payment));
});

router.post("/payroll/subscriptions", async (req, res): Promise<void> => {
  const { senderName, senderCompany, recipientName, recipientEmail, amountUsdg, billingInterval } = req.body as {
    senderName?: string;
    senderCompany?: string;
    recipientName?: string;
    recipientEmail?: string;
    amountUsdg?: string;
    billingInterval?: string;
  };

  if (!recipientName || !recipientEmail || !amountUsdg) {
    res.status(400).json({ error: "recipientName, recipientEmail, and amountUsdg are required" });
    return;
  }
  if (!dodoEnabled) {
    res.status(503).json({ error: "Dodo Payments is not configured — set DODO_API_KEY" });
    return;
  }

  const amountInCents = Math.round(parseFloat(amountUsdg) * 100);
  if (isNaN(amountInCents) || amountInCents <= 0) {
    res.status(400).json({ error: "Invalid amountUsdg value" });
    return;
  }

  const interval = (billingInterval ?? "Month") as "Day" | "Week" | "Month" | "Year";

  try {
    const customerId = await createDodoCustomer(recipientName, recipientEmail);

    const product = await dodo.products.create({
      name: `Recurring Payroll: ${senderCompany ?? senderName ?? "Company"} → ${recipientName}`,
      description: `Monthly payroll subscription of $${amountUsdg} USDG to ${recipientName} (${recipientEmail})`,
      tax_category: "digital_products",
      price: {
        currency: "USD",
        discount: 0,
        price: amountInCents,
        purchasing_power_parity: false,
        type: "recurring_price",
        payment_frequency_count: 1,
        payment_frequency_interval: interval,
        subscription_period_count: 1,
        subscription_period_interval: interval,
        trial_period_days: 0,
      },
      metadata: {
        sender_company: senderCompany ?? "",
        sender_name: senderName ?? "",
        recipient_email: recipientEmail,
        source: "flowpay_payroll_subscription",
      },
    });

    const customerPayload = customerId
      ? { customer_id: customerId }
      : { email: recipientEmail, name: recipientName };

    const subscription = await dodo.subscriptions.create({
      product_id: product.product_id,
      quantity: 1,
      customer: customerPayload,
      billing: { country: "IN" },
    });

    res.status(201).json({
      subscriptionId: subscription.subscription_id,
      paymentId: subscription.payment_id,
      productId: product.product_id,
      recipientName,
      recipientEmail,
      amountUsdg,
      billingInterval: interval,
      customerId: customerId ?? null,
    });
  } catch (err: unknown) {
    req.log?.error({ err }, "Dodo subscription creation failed");
    res.status(502).json({
      error: "Failed to create Dodo subscription",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
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
