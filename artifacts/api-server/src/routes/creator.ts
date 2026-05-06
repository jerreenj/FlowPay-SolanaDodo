import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, creatorProductsTable, creatorSalesTable } from "@workspace/db";
import { CreateCreatorProductBody, GetCreatorProductParams, PurchaseCreatorProductBody, PurchaseCreatorProductParams } from "@workspace/api-zod";
import { dodo, dodoEnabled, DODO_RETURN_URL_BASE } from "../lib/dodo";

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
    createdAt: sale.createdAt,
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
    createdAt: s.createdAt,
  })));
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
