const state = globalThis.__flowpayMockState ??= {
  users: [{ id: 1, name: "Demo User", email: "demo@flowpay.in", password: "demo123", walletAddress: "DemoFlowPayWallet1111111111111111111111111", createdAt: new Date().toISOString() }],
  payroll: [],
  remittances: [],
  escrows: [],
  products: [],
  sales: [],
  agents: [],
  agentTransactions: [],
};

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function id(list) {
  return list.length ? Math.max(...list.map((item) => Number(item.id) || 0)) + 1 : 1;
}

function signature() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function tokenFor(user) {
  return Buffer.from(JSON.stringify({ userId: user.id, ts: Date.now() })).toString("base64");
}

function userFromToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return state.users[0];
  try {
    const { userId } = JSON.parse(Buffer.from(header.slice(7), "base64").toString());
    return state.users.find((user) => user.id === userId) || state.users[0];
  } catch {
    return state.users[0];
  }
}

async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString();
  return text ? JSON.parse(text) : {};
}

function money(value, fallback = "0") {
  const parsed = Number.parseFloat(String(value ?? fallback));
  return Number.isFinite(parsed) ? parsed : 0;
}

function paymentBase(input, type) {
  const amountUsdg = String(input.amountUsdg ?? input.priceUsdg ?? "1.00");
  const amount = money(amountUsdg);
  return {
    id: 0,
    type,
    amountUsdg,
    feeUsdg: (amount * 0.005).toFixed(4),
    amountInr: (amount * 83.5).toFixed(2),
    status: "completed",
    solanaSignature: signature(),
    settlementSeconds: (1.8 + Math.random()).toFixed(1),
    dodoPaymentId: `mock_dodo_${Date.now()}`,
    dodoCheckoutUrl: null,
    createdAt: new Date().toISOString(),
  };
}

function dashboardStats() {
  const sum = (list) => list.reduce((total, item) => total + money(item.amountUsdg), 0);
  const payrollVolume = sum(state.payroll);
  const remittanceVolume = sum(state.remittances);
  const escrowVolume = sum(state.escrows);
  const creatorVolume = sum(state.sales);
  const agentVolume = sum(state.agentTransactions);
  const totalVolume = payrollVolume + remittanceVolume + escrowVolume + creatorVolume + agentVolume;
  return {
    totalVolume: totalVolume.toFixed(2),
    totalTransactions: state.payroll.length + state.remittances.length + state.escrows.length + state.sales.length + state.agentTransactions.length,
    totalFees: (totalVolume * 0.01).toFixed(2),
    activeUsers: state.users.length,
    payrollVolume: payrollVolume.toFixed(2),
    remittanceVolume: remittanceVolume.toFixed(2),
    escrowVolume: escrowVolume.toFixed(2),
    creatorVolume: creatorVolume.toFixed(2),
    agentVolume: agentVolume.toFixed(2),
    avgSettlementSeconds: 2.3,
  };
}

function activity() {
  return [
    ...state.payroll.map((p) => ({ id: p.id * 10 + 1, type: "payroll", description: `${p.senderCompany} paid ${p.recipientName}`, amount: p.amountUsdg, currency: "USDC", status: p.status, createdAt: p.createdAt })),
    ...state.remittances.map((r) => ({ id: r.id * 10 + 2, type: "remittance", description: `${r.senderName} (${r.senderCountry}) to ${r.recipientName}`, amount: r.amountUsdg, currency: "USDC", status: r.status, createdAt: r.createdAt })),
    ...state.escrows.map((e) => ({ id: e.id * 10 + 3, type: "escrow", description: `Escrow: ${e.projectTitle}`, amount: e.amountUsdg, currency: "USDC", status: e.status, createdAt: e.createdAt })),
    ...state.sales.map((s) => ({ id: s.id * 10 + 4, type: "creator", description: `${s.buyerName} purchased "${s.productTitle}"`, amount: s.amountUsdg, currency: "USDC", status: "completed", createdAt: s.createdAt })),
    ...state.agentTransactions.map((a) => ({ id: a.id * 10 + 5, type: "agent", description: `Agent "${a.agentName}" - ${a.purpose}`, amount: a.amountUsdg, currency: "USDC", status: "completed", createdAt: a.createdAt })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);
}

module.exports = async function mockApp(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || "flowpay.local"}`);
  const path = url.pathname.replace(/^\/api/, "") || "/health";
  const method = req.method || "GET";

  if (method === "GET" && path === "/health") return json(res, 200, { ok: true, mode: "serverless-mock" });
  if (method === "GET" && path === "/rates") return json(res, 200, { INR: 83.5, USD: 1, AED: 3.67, GBP: 0.79, usdgToInr: 83.5, usdgToUsd: 1, usdgToAed: 3.67, usdgToGbp: 0.79 });
  if (method === "GET" && path === "/dashboard/stats") return json(res, 200, dashboardStats());
  if (method === "GET" && path === "/dashboard/activity") return json(res, 200, activity());
  if (method === "GET" && path === "/wallet") return json(res, 200, { address: userFromToken(req).walletAddress, usdgBalance: "100.00", inrBalance: "0.00", totalReceived: "0.00", totalSent: "0.00", transactions: activity() });

  if (path === "/auth/me") return json(res, 200, userFromToken(req));
  if (method === "PATCH" && path === "/auth/profile") {
    const input = await body(req);
    const user = userFromToken(req);
    user.name = String(input.name || user.name);
    return json(res, 200, user);
  }
  if (method === "POST" && (path === "/auth/login" || path === "/auth/register" || path === "/auth/wallet")) {
    const input = await body(req);
    let user = path === "/auth/login" ? state.users.find((u) => u.email === input.email && u.password === input.password) : null;
    if (!user) {
      user = { id: id(state.users), name: input.name || input.walletAddress?.slice(0, 12) || "FlowPay User", email: input.email || `${Date.now()}@wallet.flowpay`, password: input.password || "", walletAddress: input.walletAddress || signature().slice(0, 44), createdAt: new Date().toISOString() };
      state.users.push(user);
    }
    return json(res, path === "/auth/login" ? 200 : 201, { token: tokenFor(user), user });
  }

  if (method === "GET" && path === "/payroll/payments") return json(res, 200, state.payroll);
  if (method === "GET" && path === "/payroll/stats") return json(res, 200, { totalPayments: state.payroll.length, totalVolume: dashboardStats().payrollVolume, totalFees: (money(dashboardStats().payrollVolume) * 0.005).toFixed(2), avgSettlementSeconds: 2.3, completedCount: state.payroll.length, pendingCount: 0 });
  if (method === "POST" && path === "/payroll/payments") {
    const input = await body(req);
    const item = { ...paymentBase(input, "payroll"), ...input };
    item.id = id(state.payroll);
    state.payroll.unshift(item);
    return json(res, 201, item);
  }

  if (method === "GET" && path === "/remittances") return json(res, 200, state.remittances);
  if (method === "GET" && path === "/remittances/stats") return json(res, 200, { totalRemittances: state.remittances.length, totalVolume: dashboardStats().remittanceVolume, totalFees: (money(dashboardStats().remittanceVolume) * 0.0075).toFixed(2), avgSettlementSeconds: 2.3, completedCount: state.remittances.length });
  if (method === "POST" && path === "/remittances") {
    const input = await body(req);
    const item = { ...paymentBase(input, "remittance"), ...input, id: id(state.remittances) };
    state.remittances.unshift(item);
    return json(res, 201, item);
  }

  if (method === "GET" && path === "/escrows") return json(res, 200, state.escrows);
  if (method === "POST" && path === "/escrows") {
    const input = await body(req);
    const item = { ...paymentBase(input, "escrow"), ...input, id: id(state.escrows), status: "funded" };
    state.escrows.unshift(item);
    return json(res, 201, item);
  }
  if (method === "PATCH" && path.startsWith("/escrows/")) {
    const [, , rawId, action] = path.split("/");
    const item = state.escrows.find((e) => e.id === Number(rawId));
    if (item) item.status = action === "dispute" ? "disputed" : "completed";
    return json(res, 200, item || { ok: true });
  }

  if (method === "GET" && path === "/creator/products") return json(res, 200, state.products);
  if (method === "GET" && path === "/creator/sales") return json(res, 200, state.sales);
  if (method === "GET" && path.startsWith("/creator/products/")) return json(res, 200, state.products.find((p) => p.id === Number(path.split("/")[3])) || null);
  if (method === "GET" && path.startsWith("/creator/sales/")) return json(res, 200, state.sales.find((s) => s.id === Number(path.split("/")[3])) || null);
  if (method === "POST" && path === "/creator/products") {
    const input = await body(req);
    const item = { ...input, id: id(state.products), ownerId: userFromToken(req).id, priceUsdg: String(input.priceUsdg || "1.00"), salesCount: 0, revenue: "0.00", shareUrl: `/buy/${id(state.products)}`, createdAt: new Date().toISOString() };
    state.products.unshift(item);
    return json(res, 201, item);
  }
  if (method === "POST" && path.endsWith("/purchase")) {
    const productId = Number(path.split("/")[3]);
    const product = state.products.find((p) => p.id === productId) || { id: productId, title: "FlowPay product", priceUsdg: "1.00" };
    const input = await body(req);
    const sale = { ...paymentBase({ amountUsdg: product.priceUsdg }, "creator"), id: id(state.sales), productId, productTitle: product.title, buyerName: input.buyerName || "Buyer", buyerEmail: input.buyerEmail || "", amountUsdg: product.priceUsdg, creatorReceives: (money(product.priceUsdg) * 0.98).toFixed(4) };
    state.sales.unshift(sale);
    return json(res, 201, sale);
  }

  if (method === "GET" && path === "/agents") return json(res, 200, state.agents);
  if (method === "POST" && path === "/agents") {
    const input = await body(req);
    const item = { ...input, id: id(state.agents), walletAddress: signature().slice(0, 44), usdgBalance: "0.00", totalPaid: "0.00", totalReceived: "0.00", transactionCount: 0, isActive: true, x402Enabled: String(Boolean(input.x402Enabled)), createdAt: new Date().toISOString() };
    state.agents.unshift(item);
    return json(res, 201, item);
  }
  if (method === "GET" && path.match(/^\/agents\/\d+\/transactions$/)) return json(res, 200, state.agentTransactions.filter((t) => t.agentId === Number(path.split("/")[2])));
  if (method === "POST" && path.match(/^\/agents\/\d+\/(fund|pay)$/)) {
    const input = await body(req);
    const agentId = Number(path.split("/")[2]);
    const agent = state.agents.find((a) => a.id === agentId) || { name: "Agent" };
    const tx = { ...paymentBase({ amountUsdg: input.amountUsdg || "0.01" }, "agent"), id: id(state.agentTransactions), agentId, agentName: agent.name, purpose: input.purpose || (path.endsWith("/fund") ? "Wallet funding" : "x402 API payment") };
    state.agentTransactions.unshift(tx);
    return json(res, 201, tx);
  }

  return json(res, 404, { error: `Mock route not found: ${method} ${path}` });
};
