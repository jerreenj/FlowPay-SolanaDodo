import { Router, type IRouter } from "express";
import { db, payrollPaymentsTable, remittancesTable, escrowsTable, creatorSalesTable, agentTransactionsTable, usersTable } from "@workspace/db";
import { count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [payrollRows] = await db.select({
    total: count(),
    volume: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
    fees: sql<string>`COALESCE(SUM(CAST(fee_usdg AS NUMERIC)), 0)::text`,
  }).from(payrollPaymentsTable);

  const [remittanceRows] = await db.select({
    total: count(),
    volume: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
    fees: sql<string>`COALESCE(SUM(CAST(fee_usdg AS NUMERIC)), 0)::text`,
  }).from(remittancesTable);

  const [escrowRows] = await db.select({
    total: count(),
    volume: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
    fees: sql<string>`COALESCE(SUM(CAST(fee_usdg AS NUMERIC)), 0)::text`,
  }).from(escrowsTable);

  const [creatorRows] = await db.select({
    total: count(),
    volume: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
    fees: sql<string>`COALESCE(SUM(CAST(fee_usdg AS NUMERIC)), 0)::text`,
  }).from(creatorSalesTable);

  const [agentRows] = await db.select({
    total: count(),
    volume: sql<string>`COALESCE(SUM(CAST(amount_usdg AS NUMERIC)), 0)::text`,
  }).from(agentTransactionsTable);

  const [userRows] = await db.select({ total: count() }).from(usersTable);

  const totalVolume = (
    parseFloat(payrollRows?.volume ?? "0") +
    parseFloat(remittanceRows?.volume ?? "0") +
    parseFloat(escrowRows?.volume ?? "0") +
    parseFloat(creatorRows?.volume ?? "0") +
    parseFloat(agentRows?.volume ?? "0")
  ).toFixed(2);

  const totalFees = (
    parseFloat(payrollRows?.fees ?? "0") +
    parseFloat(remittanceRows?.fees ?? "0") +
    parseFloat(escrowRows?.fees ?? "0") +
    parseFloat(creatorRows?.fees ?? "0")
  ).toFixed(2);

  const totalTx =
    (payrollRows?.total ?? 0) +
    (remittanceRows?.total ?? 0) +
    (escrowRows?.total ?? 0) +
    (creatorRows?.total ?? 0) +
    (agentRows?.total ?? 0);

  res.json({
    totalVolume,
    totalTransactions: totalTx,
    totalFees,
    activeUsers: userRows?.total ?? 0,
    payrollVolume: payrollRows?.volume ?? "0.00",
    remittanceVolume: remittanceRows?.volume ?? "0.00",
    escrowVolume: escrowRows?.volume ?? "0.00",
    creatorVolume: creatorRows?.volume ?? "0.00",
    agentVolume: agentRows?.volume ?? "0.00",
    solanaTransactions: totalTx,
    avgSettlementSeconds: 2.3,
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const payroll = await db.select().from(payrollPaymentsTable).orderBy(sql`created_at DESC`).limit(5);
  const remittances = await db.select().from(remittancesTable).orderBy(sql`created_at DESC`).limit(5);
  const escrows = await db.select().from(escrowsTable).orderBy(sql`created_at DESC`).limit(5);
  const sales = await db.select().from(creatorSalesTable).orderBy(sql`created_at DESC`).limit(5);
  const agents = await db.select().from(agentTransactionsTable).orderBy(sql`created_at DESC`).limit(5);

  const items = [
    ...payroll.map((p) => ({
      id: p.id * 10 + 1,
      type: "payroll" as const,
      description: `${p.senderCompany} paid ${p.recipientName}`,
      amount: p.amountUsdg,
      currency: "USDG",
      status: p.status,
      createdAt: p.createdAt,
    })),
    ...remittances.map((r) => ({
      id: r.id * 10 + 2,
      type: "remittance" as const,
      description: `${r.senderName} (${r.senderCountry}) → ${r.recipientName}`,
      amount: r.amountUsdg,
      currency: "USDG",
      status: r.status,
      createdAt: r.createdAt,
    })),
    ...escrows.map((e) => ({
      id: e.id * 10 + 3,
      type: "escrow" as const,
      description: `Escrow: ${e.projectTitle}`,
      amount: e.amountUsdg,
      currency: "USDG",
      status: e.status,
      createdAt: e.createdAt,
    })),
    ...sales.map((s) => ({
      id: s.id * 10 + 4,
      type: "creator" as const,
      description: `${s.buyerName} purchased "${s.productTitle}"`,
      amount: s.amountUsdg,
      currency: "USDG",
      status: "completed",
      createdAt: s.createdAt,
    })),
    ...agents.map((a) => ({
      id: a.id * 10 + 5,
      type: "agent" as const,
      description: `Agent "${a.agentName}" — ${a.purpose}`,
      amount: a.amountUsdg,
      currency: "USDG",
      status: "completed",
      createdAt: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  res.json(items);
});

export default router;
