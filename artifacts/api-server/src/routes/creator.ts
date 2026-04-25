import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, creatorProductsTable, creatorSalesTable } from "@workspace/db";
import { CreateCreatorProductBody, GetCreatorProductParams, PurchaseCreatorProductBody, PurchaseCreatorProductParams } from "@workspace/api-zod";

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
    createdAt: p.createdAt,
  };
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

  const [row] = await db.insert(creatorProductsTable).values({
    creatorName,
    title,
    description,
    type: type ?? "course",
    priceUsdg,
    salesCount: 0,
    totalRevenue: "0.00",
    isActive: "true",
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
