import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, agentsTable, agentTransactionsTable } from "@workspace/db";
import { CreateAgentBody, GetAgentParams, FundAgentParams, FundAgentBody, AgentPayParams, AgentPayBody, ListAgentTransactionsParams } from "@workspace/api-zod";
import { dodo, dodoEnabled, DODO_RETURN_URL_BASE } from "../lib/dodo";

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
  const amountInCents = Math.round(parseFloat(body.data.amountUsdg) * 100);

  let dodoSessionId: string | null = null;
  let dodoCheckoutUrl: string | null = null;

  if (dodoEnabled) {
    try {
      const product = await dodo.products.create({
        name: `AgentBank: Fund "${agent.name}"`,
        description: `Fund AI agent wallet with $${body.data.amountUsdg} USDG. Agent: ${agent.name}, Owner: ${agent.ownerName}. Wallet: ${agent.walletAddress}`,
        tax_category: "digital_products",
        price: {
          currency: "USD",
          discount: 0,
          price: amountInCents,
          purchasing_power_parity: false,
          type: "one_time_price",
        },
        metadata: {
          agent_name: agent.name,
          agent_id: String(agent.id),
          agent_wallet: agent.walletAddress,
          amount_usdg: body.data.amountUsdg,
          solana_sig: signature,
          source: "flowpay_agent_fund",
        },
      });
      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: product.product_id, quantity: 1 }],
        customer: {
          email: `${agent.ownerName.toLowerCase().replace(/\s+/g, ".")}@agent.flowpay`,
          name: agent.ownerName,
        },
        return_url: `${DODO_RETURN_URL_BASE}/agents`,
      });
      dodoSessionId = session.session_id;
      dodoCheckoutUrl = session.checkout_url ?? null;
    } catch (err: unknown) {
      req.log?.warn({ err }, "Dodo agent fund session creation failed");
    }
  }

  const [updated] = await db.update(agentsTable)
    .set({ usdgBalance: newBalance, totalReceived: newReceived, transactionCount: agent.transactionCount + 1 })
    .where(eq(agentsTable.id, params.data.id))
    .returning();

  await db.insert(agentTransactionsTable).values({
    agentId: agent.id,
    agentName: agent.name,
    type: "fund",
    amountUsdg: body.data.amountUsdg,
    purpose: dodoCheckoutUrl
      ? `Wallet funded via Dodo Payments (${dodoSessionId?.slice(0, 16)}…)`
      : "Wallet funded via Dodo Payments",
    solanaSignature: signature,
    settlementMs: (Math.random() * 500 + 200).toFixed(0),
    dodoSessionId,
    dodoCheckoutUrl,
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
    dodoSessionId: tx.dodoSessionId ?? null,
    dodoCheckoutUrl: tx.dodoCheckoutUrl ?? null,
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
    dodoSessionId: t.dodoSessionId ?? null,
    dodoCheckoutUrl: t.dodoCheckoutUrl ?? null,
    createdAt: t.createdAt,
  })));
});

export default router;
