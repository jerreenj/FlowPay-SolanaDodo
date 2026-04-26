import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, agentsTable, agentTransactionsTable } from "@workspace/db";
import { CreateAgentBody, GetAgentParams, FundAgentParams, FundAgentBody, AgentPayParams, AgentPayBody, ListAgentTransactionsParams } from "@workspace/api-zod";

const router: IRouter = Router();

function generateWalletAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function generateSolanaSignature(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function mapAgent(a: typeof agentsTable.$inferSelect) {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    ownerName: a.ownerName,
    walletAddress: a.walletAddress,
    usdgBalance: a.usdgBalance,
    totalPaid: a.totalPaid,
    totalReceived: a.totalReceived,
    transactionCount: a.transactionCount,
    isActive: a.isActive,
    x402Enabled: a.x402Enabled,
    createdAt: a.createdAt,
  };
}

router.get("/agents", async (_req, res): Promise<void> => {
  const rows = await db.select().from(agentsTable).orderBy(sql`created_at DESC`);
  res.json(rows.map(mapAgent));
});

router.post("/agents", async (req, res): Promise<void> => {
  const parsed = CreateAgentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, ownerName, x402Enabled } = parsed.data;
  const walletAddress = generateWalletAddress();

  const [row] = await db.insert(agentsTable).values({
    name,
    description,
    ownerName,
    walletAddress,
    usdgBalance: "0.00",
    totalPaid: "0.00",
    totalReceived: "0.00",
    transactionCount: 0,
    isActive: "true",
    x402Enabled: x402Enabled ? "true" : "false",
  }).returning();

  res.status(201).json(mapAgent(row));
});

router.get("/agents/:id", async (req, res): Promise<void> => {
  const params = GetAgentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(agentsTable).where(eq(agentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  res.json(mapAgent(row));
});

router.post("/agents/:id/fund", async (req, res): Promise<void> => {
  const params = FundAgentParams.safeParse(req.params);
  const body = FundAgentBody.safeParse(req.body);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, params.data.id));
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  const newBalance = (parseFloat(agent.usdgBalance) + parseFloat(body.data.amountUsdg)).toFixed(4);
  const newReceived = (parseFloat(agent.totalReceived) + parseFloat(body.data.amountUsdg)).toFixed(4);
  const signature = generateSolanaSignature();

  const [updated] = await db.update(agentsTable)
    .set({ usdgBalance: newBalance, totalReceived: newReceived, transactionCount: agent.transactionCount + 1 })
    .where(eq(agentsTable.id, params.data.id))
    .returning();

  await db.insert(agentTransactionsTable).values({
    agentId: agent.id,
    agentName: agent.name,
    type: "fund",
    amountUsdg: body.data.amountUsdg,
    purpose: "Wallet funded via Dodo Payments",
    solanaSignature: signature,
    settlementMs: (Math.random() * 500 + 200).toFixed(0),
  });

  res.json(mapAgent(updated));
});

router.post("/agents/:id/pay", async (req, res): Promise<void> => {
  const params = AgentPayParams.safeParse(req.params);
  const body = AgentPayBody.safeParse(req.body);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, params.data.id));
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  const amount = parseFloat(body.data.amountUsdg);
  if (parseFloat(agent.usdgBalance) < amount) {
    res.status(400).json({ error: "Insufficient agent balance" });
    return;
  }

  const newBalance = (parseFloat(agent.usdgBalance) - amount).toFixed(4);
  const newPaid = (parseFloat(agent.totalPaid) + amount).toFixed(4);
  const signature = generateSolanaSignature();
  const settlementMs = (Math.random() * 300 + 100).toFixed(0);

  await db.update(agentsTable)
    .set({ usdgBalance: newBalance, totalPaid: newPaid, transactionCount: agent.transactionCount + 1 })
    .where(eq(agentsTable.id, params.data.id));

  const [tx] = await db.insert(agentTransactionsTable).values({
    agentId: agent.id,
    agentName: agent.name,
    type: "outgoing",
    recipientName: body.data.recipientName,
    recipientAddress: body.data.recipientAddress,
    amountUsdg: body.data.amountUsdg,
    purpose: body.data.purpose,
    solanaSignature: signature,
    settlementMs,
  }).returning();

  res.status(201).json({
    id: tx.id,
    agentId: tx.agentId,
    agentName: tx.agentName,
    type: tx.type,
    recipientName: tx.recipientName ?? null,
    recipientAddress: tx.recipientAddress ?? null,
    amountUsdg: tx.amountUsdg,
    purpose: tx.purpose,
    solanaSignature: tx.solanaSignature ?? null,
    settlementMs: tx.settlementMs ? parseFloat(tx.settlementMs) : null,
    createdAt: tx.createdAt,
  });
});

router.get("/agents/:id/transactions", async (req, res): Promise<void> => {
  const params = ListAgentTransactionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db.select().from(agentTransactionsTable)
    .where(eq(agentTransactionsTable.agentId, params.data.id))
    .orderBy(sql`created_at DESC`);

  res.json(rows.map((t) => ({
    id: t.id,
    agentId: t.agentId,
    agentName: t.agentName,
    type: t.type,
    recipientName: t.recipientName ?? null,
    recipientAddress: t.recipientAddress ?? null,
    amountUsdg: t.amountUsdg,
    purpose: t.purpose,
    solanaSignature: t.solanaSignature ?? null,
    settlementMs: t.settlementMs ? parseFloat(t.settlementMs) : null,
    createdAt: t.createdAt,
  })));
});

export default router;
