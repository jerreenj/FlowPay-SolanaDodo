import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Bot, Plus, Zap, ArrowUpRight, ArrowDownLeft, Copy } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  description: string;
  ownerName: string;
  walletAddress: string;
  usdgBalance: string;
  totalPaid: string;
  totalReceived: string;
  transactionCount: number;
  isActive: string;
  x402Enabled: string;
  createdAt: string;
}

interface Tx {
  id: number;
  agentId: number;
  agentName: string;
  type: string;
  recipientName: string | null;
  recipientAddress: string | null;
  amountUsdg: string;
  purpose: string;
  solanaSignature: string | null;
  settlementMs: number | null;
  createdAt: string;
}

export default function Agents() {
  const token = useAuthStore((s) => s.token);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [txs, setTxs] = useState<Record<number, Tx[]>>({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [action, setAction] = useState<"fund" | "pay" | null>(null);
  const [form, setForm] = useState({ name: "", description: "", ownerName: "", x402Enabled: false });
  const [fundAmount, setFundAmount] = useState("");
  const [payForm, setPayForm] = useState({ recipientName: "", recipientAddress: "", amountUsdg: "", purpose: "" });

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const data = await apiFetch("/api/agents", { headers: authHeaders }).then((r) => r.json());
      setAgents(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function loadTxs(agentId: number) {
    const data = await apiFetch(`/api/agents/${agentId}/transactions`, { headers: authHeaders }).then((r) => r.json());
    setTxs((t) => ({ ...t, [agentId]: data }));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/agents", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ ...form, x402Enabled: form.x402Enabled }),
      });
      if (!res.ok) throw new Error();
      setShowForm(false);
      setForm({ name: "", description: "", ownerName: "", x402Enabled: false });
      await load();
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  async function handleFund(agentId: number) {
    setSubmitting(true);
    try {
      await apiFetch(`/api/agents/${agentId}/fund`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ amountUsdg: fundAmount }),
      });
      setAction(null);
      setFundAmount("");
      await load();
      if (txs[agentId]) await loadTxs(agentId);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  async function handlePay(agentId: number) {
    setSubmitting(true);
    try {
      await apiFetch(`/api/agents/${agentId}/pay`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payForm),
      });
      setAction(null);
      setPayForm({ recipientName: "", recipientAddress: "", amountUsdg: "", purpose: "" });
      await load();
      if (txs[agentId]) await loadTxs(agentId);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-5 h-5 text-[#00ff88]" />
              <h1 className="text-2xl font-bold text-white">AgentBank</h1>
              <span className="text-xs bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 px-2 py-0.5 rounded-full font-mono">1% fee</span>
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">x402 ready</span>
            </div>
            <p className="text-white/50 text-sm">Autonomous AI agent wallets on Solana — machine-to-machine payments at &lt;500ms</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Deploy Agent
          </button>
        </div>

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-5">Deploy New Agent</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Agent Name</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="PayBot Alpha"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Owner Name</label>
                <input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} required placeholder="TechVentures Inc"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={2} placeholder="What does this agent do?"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.x402Enabled} onChange={(e) => set("x402Enabled", e.target.checked)}
                    className="w-4 h-4 accent-[#00ff88]" />
                  <span className="text-sm text-white/70">Enable x402 protocol</span>
                </label>
                <span className="text-xs text-white/30">(HTTP payment-gated APIs)</span>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-[#00ff88] hover:bg-[#00e87a] text-black text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? "Deploying…" : "Deploy Agent"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? [...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
          )) : agents.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-10 text-center text-white/40 text-sm">No agents deployed yet</div>
          ) : agents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <div key={agent.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#00ff88]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">{agent.name}</h3>
                          {agent.x402Enabled === "true" && (
                            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-mono">x402</span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${agent.isActive === "true" ? "bg-[#00ff88]/10 text-[#00ff88]" : "bg-white/10 text-white/40"}`}>
                            {agent.isActive === "true" ? "active" : "inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-white/40">Owner: {agent.ownerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#00ff88] font-mono">${parseFloat(agent.usdgBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-white/40">USDG balance</p>
                    </div>
                  </div>

                  <p className="text-sm text-white/50 mb-4">{agent.description}</p>

                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    {[
                      { label: "Total Paid", value: `$${parseFloat(agent.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                      { label: "Total Received", value: `$${parseFloat(agent.totalReceived).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                      { label: "Transactions", value: agent.transactionCount.toString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-[10px] text-white/40">{label}</p>
                        <p className="text-sm font-mono font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/30">
                      <span className="font-mono">{agent.walletAddress.slice(0, 14)}…</span>
                      <button onClick={() => navigator.clipboard.writeText(agent.walletAddress)} className="hover:text-white/60">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedAgent(agent); setAction("fund"); }}
                        className="flex items-center gap-1.5 text-xs bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/20 px-3 py-1.5 rounded-lg transition-colors">
                        <ArrowDownLeft className="w-3 h-3" /> Fund
                      </button>
                      <button onClick={() => { setSelectedAgent(agent); setAction("pay"); }}
                        className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                        <ArrowUpRight className="w-3 h-3" /> Pay
                      </button>
                      <button onClick={() => { setSelectedAgent(isSelected ? null : agent); if (!txs[agent.id]) loadTxs(agent.id); }}
                        className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                        <Zap className="w-3 h-3" /> {isSelected ? "Hide" : "Txs"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fund action */}
                {selectedAgent?.id === agent.id && action === "fund" && (
                  <div className="border-t border-white/10 p-4 bg-[#00ff88]/5">
                    <div className="flex gap-2">
                      <input type="number" min="0.01" step="0.01" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder="Amount (USDG)"
                        className="flex-1 bg-white/5 border border-[#00ff88]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/60" />
                      <button onClick={() => handleFund(agent.id)} disabled={submitting || !fundAmount}
                        className="bg-[#00ff88] hover:bg-[#00e87a] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                        {submitting ? "…" : "Fund"}
                      </button>
                      <button onClick={() => setAction(null)} className="px-3 py-2 bg-white/5 text-white/50 text-sm rounded-lg">✕</button>
                    </div>
                  </div>
                )}

                {/* Pay action */}
                {selectedAgent?.id === agent.id && action === "pay" && (
                  <div className="border-t border-white/10 p-4 bg-white/3">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input value={payForm.recipientName} onChange={(e) => setPayForm((f) => ({ ...f, recipientName: e.target.value }))} placeholder="Recipient name"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" />
                      <input value={payForm.recipientAddress} onChange={(e) => setPayForm((f) => ({ ...f, recipientAddress: e.target.value }))} placeholder="Wallet address"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" />
                      <input type="number" min="0.01" step="0.01" value={payForm.amountUsdg} onChange={(e) => setPayForm((f) => ({ ...f, amountUsdg: e.target.value }))} placeholder="Amount (USDG)"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" />
                      <input value={payForm.purpose} onChange={(e) => setPayForm((f) => ({ ...f, purpose: e.target.value }))} placeholder="Purpose / memo"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handlePay(agent.id)} disabled={submitting || !payForm.recipientName || !payForm.amountUsdg || !payForm.purpose}
                        className="flex-1 bg-white hover:bg-white/90 text-black text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-50">
                        {submitting ? "Sending…" : "Execute Payment"}
                      </button>
                      <button onClick={() => setAction(null)} className="px-3 py-2 bg-white/5 text-white/50 text-sm rounded-lg">✕</button>
                    </div>
                  </div>
                )}

                {/* Transactions */}
                {isSelected && txs[agent.id] && (
                  <div className="border-t border-white/10">
                    <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                      {txs[agent.id].length === 0 ? (
                        <p className="px-5 py-4 text-xs text-white/40 text-center">No transactions yet</p>
                      ) : txs[agent.id].map((tx) => (
                        <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                          <div className={`p-1.5 rounded ${tx.type === "fund" ? "bg-[#00ff88]/10" : "bg-white/5"}`}>
                            {tx.type === "fund"
                              ? <ArrowDownLeft className="w-3 h-3 text-[#00ff88]" />
                              : <ArrowUpRight className="w-3 h-3 text-white/50" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white">{tx.purpose}</p>
                            {tx.recipientName && <p className="text-[10px] text-white/40">→ {tx.recipientName}</p>}
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-mono font-semibold ${tx.type === "fund" ? "text-[#00ff88]" : "text-white/70"}`}>
                              {tx.type === "fund" ? "+" : "-"}${parseFloat(tx.amountUsdg).toFixed(4)}
                            </p>
                            {tx.settlementMs && <p className="text-[10px] text-white/30">{tx.settlementMs.toFixed(0)}ms</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
