import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, creatorProductsTable, creatorSalesTable } from "@workspace/db";
import { CreateCreatorProductBody, GetCreatorProductParams, PurchaseCreatorProductBody, PurchaseCreatorProductParams } from "@workspace/api-zod";
import { dodo, dodoEnabled, dodoWebhookKey, DODO_RETURN_URL_BASE } from "../lib/dodo";

const router: IRouter = Router();

function generateSolanaSignature(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function calcFee(amount: string): string {
  return (parseFloat(amount) * 0.02).toFixed(4);
}

function mapProduct(p: typeof creatorProductsTable.$inferSelect) {
  return {
    id: p.id,
    creatorName: p.creatorName,
    title: p.title,
    description: p.description,
    type: p.type,
    priceUsdg: p.priceUsdg,
    salesCount: p.salesCount,
    totalRevenue: p.totalRevenue,
    isActive: p.isActive,
    dodoProductId: p.dodoProductId ?? null,
    createdAt: p.createdAt,
  };
}

// Map our product type to Dodo tax category
function toDodoTaxCategory(type: string): "digital_products" | "saas" | "e_book" | "edtech" {
  if (type === "ebook") return "e_book";
  if (type === "course" || type === "newsletter") return "edtech";
  return "digital_products";
}

router.get("/creator/products", async (_req, res): Promise<void> => {
  const rows = await db.select().from(creatorProductsTable).orderBy(sql`created_at DESC`);
  res.json(rows.map(mapProduct));
});

router.post("/creator/products", async (req, res): Promise<void> => {
  const parsed = CreateCreatorProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { creatorName, title, description, type, priceUsdg } = parsed.data;

  // Create a real Dodo product
  let dodoProductId: string | null = null;
  if (dodoEnabled) {
    try {
      const priceInCents = Math.round(parseFloat(priceUsdg) * 100);
      const dodoProduct = await dodo.products.create({
        name: title,
        description,
        tax_category: toDodoTaxCategory(type ?? "course"),
        price: {
          currency: "USD",
          discount: 0,
          price: priceInCents,
          purchasing_power_parity: false,
          type: "one_time_price",
        },
        metadata: {
          creator_name: creatorName,
          product_type: type ?? "course",
          source: "flowpay_creator",
        },
      });
      dodoProductId = dodoProduct.product_id;
    } catch (err: unknown) {
      req.log?.warn({ err }, "Dodo product creation failed — continuing without Dodo product id");
    }
  }

  const [row] = await db.insert(creatorProductsTable).values({
    creatorName,
    title,
    description,
    type: type ?? "course",
    priceUsdg,
    salesCount: 0,
    totalRevenue: "0.00",
    isActive: "true",
    dodoProductId,
  }).returning();

  res.status(201).json(mapProduct(row));
});

router.get("/creator/products/:id", async (req, res): Promise<void> => {
  const params = GetCreatorProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(creatorProductsTable).where(eq(creatorProductsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(mapProduct(row));
});

router.post("/creator/products/:id/purchase", async (req, res): Promise<void> => {
  const params = PurchaseCreatorProductParams.safeParse(req.params);
  const body = PurchaseCreatorProductBody.safeParse(req.body);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [product] = await db.select().from(creatorProductsTable).where(eq(creatorProductsTable.id, params.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const feeUsdg = calcFee(product.priceUsdg);
  const creatorReceives = (parseFloat(product.priceUsdg) - parseFloat(feeUsdg)).toFixed(4);
  const solanaSignature = generateSolanaSignature();

  // If this product has a real Dodo product, create a real checkout session
  let dodoCheckoutUrl: string | null = null;
  let dodoSessionId: string | null = null;

  if (dodoEnabled && product.dodoProductId) {
    try {
      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: product.dodoProductId, quantity: 1 }],
        customer: {
          email: body.data.buyerEmail,
          name: body.data.buyerName,
        },
        metadata: {
          product_title: product.title,
          creator_name: product.creatorName,
          solana_sig: solanaSignature,
          source: "flowpay_creator_buy",
        },
        return_url: `${DODO_RETURN_URL_BASE}/buy/${product.id}?status=success`,
      });
      dodoSessionId = session.session_id;
      dodoCheckoutUrl = session.checkout_url ?? null;
    } catch (err: unknown) {
      req.log?.warn({ err }, "Dodo purchase session creation failed — recording sale without redirect");
    }
  }

  const [sale] = await db.insert(creatorSalesTable).values({
    productId: product.id,
    productTitle: product.title,
    creatorName: product.creatorName,
    buyerName: body.data.buyerName,
    buyerEmail: body.data.buyerEmail,
    amountUsdg: product.priceUsdg,
    feeUsdg,
    creatorReceives,
    solanaSignature,
    dodoSessionId,
    dodoCheckoutUrl,
  }).returning();

  await db.update(creatorProductsTable)
    .set({
      salesCount: product.salesCount + 1,
      totalRevenue: (parseFloat(product.totalRevenue) + parseFloat(creatorReceives)).toFixed(4),
    })
    .where(eq(creatorProductsTable.id, product.id));

  res.status(201).json({
    id: sale.id,
    productId: sale.productId,
    productTitle: sale.productTitle,
    creatorName: sale.creatorName,
    buyerName: sale.buyerName,
    buyerEmail: sale.buyerEmail,
    amountUsdg: sale.amountUsdg,
    feeUsdg: sale.feeUsdg,
    creatorReceives: sale.creatorReceives,
    solanaSignature: sale.solanaSignature ?? null,
    dodoCheckoutUrl,
    dodoSessionId,
    dodoPaymentStatus: sale.dodoPaymentStatus,
    createdAt: sale.createdAt,
  });
});

router.get("/creator/sales/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id ?? "", 10);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid sale id" });
    return;
  }
  const [s] = await db.select().from(creatorSalesTable).where(eq(creatorSalesTable.id, id));
  if (!s) {
    res.status(404).json({ error: "Sale not found" });
    return;
  }
  res.json({
    id: s.id,
    productId: s.productId,
    productTitle: s.productTitle,
    creatorName: s.creatorName,
    buyerName: s.buyerName,
    buyerEmail: s.buyerEmail,
    amountUsdg: s.amountUsdg,
    feeUsdg: s.feeUsdg,
    creatorReceives: s.creatorReceives,
    solanaSignature: s.solanaSignature ?? null,
    dodoSessionId: s.dodoSessionId ?? null,
    dodoCheckoutUrl: s.dodoCheckoutUrl ?? null,
    dodoPaymentStatus: s.dodoPaymentStatus,
    createdAt: s.createdAt,
  });
});

router.get("/creator/sales", async (_req, res): Promise<void> => {
  const rows = await db.select().from(creatorSalesTable).orderBy(sql`created_at DESC`);
  res.json(rows.map((s) => ({
    id: s.id,
    productId: s.productId,
    productTitle: s.productTitle,
    creatorName: s.creatorName,
    buyerName: s.buyerName,
    buyerEmail: s.buyerEmail,
    amountUsdg: s.amountUsdg,
    feeUsdg: s.feeUsdg,
    creatorReceives: s.creatorReceives,
    solanaSignature: s.solanaSignature ?? null,
    dodoSessionId: s.dodoSessionId ?? null,
    dodoCheckoutUrl: s.dodoCheckoutUrl ?? null,
    dodoPaymentStatus: s.dodoPaymentStatus,
    createdAt: s.createdAt,
  })));
});

router.post("/webhooks/dodo", async (req, res): Promise<void> => {
  const rawBody = req.body instanceof Buffer ? req.body.toString("utf-8") : null;

  if (!rawBody) {
    res.status(400).json({ error: "Raw body required — ensure Content-Type is application/json" });
    return;
  }

  interface ParsedEvent {
    type: string;
    data: Record<string, unknown>;
  }
  let event: ParsedEvent | null = null;

  if (dodoWebhookKey) {
    try {
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string") headers[k] = v;
        else if (Array.isArray(v)) headers[k] = v[0] ?? "";
      }
      const verified = dodo.webhooks.unwrap(rawBody, { headers });
      event = verified as unknown as ParsedEvent;
    } catch (err) {
      req.log?.warn({ err }, "Dodo webhook signature verification failed");
      res.status(401).json({ error: "Webhook signature verification failed" });
      return;
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      req.log?.error("DODO_WEBHOOK_KEY is not set in production — rejecting unsigned webhook");
      res.status(401).json({ error: "Webhook verification is required in production. Set DODO_WEBHOOK_KEY." });
      return;
    }
    req.log?.warn("DODO_WEBHOOK_KEY not set — skipping signature verification (development mode only)");
    try {
      event = JSON.parse(rawBody) as ParsedEvent;
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }

  if (!event || typeof event.type !== "string") {
    res.status(400).json({ error: "Missing or invalid event type" });
    return;
  }

  let newStatus: string | null = null;
  if (event.type === "payment.succeeded") newStatus = "paid";
  else if (event.type === "payment.failed") newStatus = "failed";
  else {
    req.log?.info({ event_type: event.type }, "Dodo webhook received but ignored (not a payment event)");
    res.json({ received: true, action: "ignored" });
    return;
  }

  const data = event.data;
  const sessionId = (typeof data.checkout_session_id === "string" ? data.checkout_session_id
    : typeof data.payment_id === "string" ? data.payment_id : undefined);

  if (!sessionId) {
    req.log?.warn({ event_type: event.type }, "Dodo webhook missing session/payment id in data");
    res.status(400).json({ error: "Missing session or payment id in event data" });
    return;
  }

  const result = await db
    .update(creatorSalesTable)
    .set({ dodoPaymentStatus: newStatus })
    .where(eq(creatorSalesTable.dodoSessionId, sessionId))
    .returning({ id: creatorSalesTable.id });

  req.log?.info({ event_type: event.type, session_id: sessionId, updated: result.length }, "Dodo webhook processed");
  res.json({ received: true, updated: result.length });
});

router.get("/creator/stats", async (_req, res): Promise<void> => {
  const [row] = await db.select({
    totalProducts: count(),
  }).from(creatorProductsTable);

  const [salesRow] = await db.select({
    totalSales: count(),
    totalRevenue: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
    totalFees: sql<string>`COALESCE(SUM(CAST(fee_usdg AS NUMERIC)), 0)::text`,
  }).from(creatorSalesTable);

  const topProducts = await db.select({
    title: creatorProductsTable.title,
    sales: creatorProductsTable.salesCount,
    revenue: creatorProductsTable.totalRevenue,
  }).from(creatorProductsTable).orderBy(sql`sales_count DESC`).limit(5);

  res.json({
    totalProducts: row?.totalProducts ?? 0,
    totalSales: salesRow?.totalSales ?? 0,
    totalRevenue: salesRow?.totalRevenue ?? "0.00",
    totalFees: salesRow?.totalFees ?? "0.00",
    topProducts: topProducts.map((p) => ({ title: p.title, sales: p.sales, revenue: p.revenue })),
  });
});

export default router;
