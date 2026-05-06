import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Bot, Plus, Zap, ArrowUpRight, ArrowDownLeft, Copy, X } from "lucide-react";

const ACCENT = "#fb923c";

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
    } catch { }
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
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setShowForm(false);
      setForm({ name: "", description: "", ownerName: "", x402Enabled: false });
      await load();
    } catch { }
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
    } catch { }
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
    } catch { }
    finally { setSubmitting(false); }
  }

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const totalBalance = agents.reduce((sum, a) => sum + parseFloat(a.usdgBalance || "0"), 0);
  const totalTxs = agents.reduce((sum, a) => sum + a.transactionCount, 0);

  return (
    <AppLayout>
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 55% 120% at 0% 0%, ${ACCENT}0a 0%, transparent 65%)` }} />
        <div className="relative z-10 flex items-start justify-between px-8 pt-8 pb-7">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 20px ${ACCENT}18` }}>
              <Bot className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-white tracking-tight">AgentBank</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>1% fee</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.10)" }}>x402</span>
              </div>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.42)" }}>Autonomous AI agent wallets on Solana — machine-to-machine payments at &lt;500ms</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all shrink-0"
            style={{ background: ACCENT, color: "#000" }}>
            <Plus className="w-4 h-4" /> Deploy Agent
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Agents Deployed", value: agents.length.toString(), colored: true },
            { label: "Total USDG Held", value: `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, colored: false },
            { label: "Total Transactions", value: totalTxs.toString(), colored: false },
          ].map(({ label, value, colored }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
              <p className="text-2xl font-bold font-mono tracking-tight" style={{ color: colored ? ACCENT : "white" }}>{value}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Deploy New Agent</h2>
              <button onClick={() => setShowForm(false)} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Agent Name</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="PayBot Alpha"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Owner</label>
                <input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} required placeholder="TechVentures Inc"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={2} placeholder="What does this agent do?"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    className="relative w-9 h-5 rounded-full transition-all cursor-pointer"
                    style={{ background: form.x402Enabled ? ACCENT : "rgba(255,255,255,0.12)" }}
                    onClick={() => set("x402Enabled", !form.x402Enabled)}
                  >
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: form.x402Enabled ? "translateX(16px)" : "translateX(0)" }} />
                  </div>
                  <div>
                    <div className="text-sm text-white">Enable x402 protocol</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>HTTP payment-gated APIs</div>
                  </div>
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="flex-1 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ background: ACCENT, color: "#000" }}>
                  {submitting ? "Deploying…" : "Deploy Agent"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 text-sm rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? [...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }} />
          )) : agents.length === 0 ? (
            <div className="rounded-2xl px-6 py-12 text-center text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}>
              No agents deployed yet
            </div>
          ) : agents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            const isActive = agent.isActive === "true";
            return (
              <div key={agent.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
                        <Bot className="w-5 h-5" style={{ color: ACCENT }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold text-[15px]">{agent.name}</h3>
                          {agent.x402Enabled === "true" && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>x402</span>
                          )}
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={isActive ? { background: "#4ade8015", color: "#4ade80", border: "1px solid #4ade8025" } : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.10)" }}>
                            {isActive ? "active" : "inactive"}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Owner: {agent.ownerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono" style={{ color: ACCENT }}>${parseFloat(agent.usdgBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>USDG balance</p>
                    </div>
                  </div>

                  <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.48)" }}>{agent.description}</p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Paid Out", value: `$${parseFloat(agent.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                      { label: "Received", value: `$${parseFloat(agent.totalReceived).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                      { label: "Transactions", value: agent.transactionCount.toString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                        <p className="text-sm font-mono font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.28)" }}>{agent.walletAddress.slice(0, 14)}…</span>
                      <button onClick={() => navigator.clipboard.writeText(agent.walletAddress)} className="transition-colors hover:text-white/60" style={{ color: "rgba(255,255,255,0.2)" }}>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedAgent(agent); setAction("fund"); }}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                        <ArrowDownLeft className="w-3 h-3" /> Fund
                      </button>
                      <button onClick={() => { setSelectedAgent(agent); setAction("pay"); }}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.10)" }}>
                        <ArrowUpRight className="w-3 h-3" /> Pay
                      </button>
                      <button onClick={() => { setSelectedAgent(isSelected ? null : agent); if (!txs[agent.id]) loadTxs(agent.id); }}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.10)" }}>
                        <Zap className="w-3 h-3" /> {isSelected ? "Hide" : "History"}
                      </button>
                    </div>
                  </div>
                </div>

                {selectedAgent?.id === agent.id && action === "fund" && (
                  <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>Fund Agent Wallet</p>
                    <div className="flex gap-2">
                      <input type="number" min="0.01" step="0.01" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder="Amount (USDG)"
                        className="flex-1 rounded-lg px-3 py-2 text-white text-sm outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                        onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")} />
                      <button onClick={() => handleFund(agent.id)} disabled={submitting || !fundAmount}
                        className="text-sm font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                        style={{ background: ACCENT, color: "#000" }}>
                        {submitting ? "…" : "Fund"}
                      </button>
                      <button onClick={() => setAction(null)} className="px-3 py-2 text-sm rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>✕</button>
                    </div>
                  </div>
                )}

                {selectedAgent?.id === agent.id && action === "pay" && (
                  <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>Execute Agent Payment</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {[
                        { key: "recipientName", placeholder: "Recipient name" },
                        { key: "recipientAddress", placeholder: "Wallet address" },
                        { key: "amountUsdg", placeholder: "Amount (USDG)", type: "number" },
                        { key: "purpose", placeholder: "Purpose / memo" },
                      ].map(({ key, placeholder, type }) => (
                        <input key={key} type={type ?? "text"} value={(payForm as any)[key]}
                          onChange={(e) => setPayForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                          className="rounded-lg px-3 py-2 text-white text-sm outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                          onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handlePay(agent.id)} disabled={submitting || !payForm.recipientName || !payForm.amountUsdg || !payForm.purpose}
                        className="flex-1 text-sm font-bold py-2 rounded-lg transition-all disabled:opacity-50"
                        style={{ background: ACCENT, color: "#000" }}>
                        {submitting ? "Sending…" : "Execute Payment"}
                      </button>
                      <button onClick={() => setAction(null)} className="px-3 py-2 text-sm rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>✕</button>
                    </div>
                  </div>
                )}

                {isSelected && txs[agent.id] && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="max-h-56 overflow-y-auto divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      {txs[agent.id].length === 0 ? (
                        <p className="px-5 py-4 text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>No transactions yet</p>
                      ) : txs[agent.id].map((tx) => (
                        <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="p-1.5 rounded-lg" style={{ background: tx.type === "fund" ? "rgba(74,222,128,0.10)" : `${ACCENT}10` }}>
                            {tx.type === "fund"
                              ? <ArrowDownLeft className="w-3 h-3" style={{ color: "#4ade80" }} />
                              : <ArrowUpRight className="w-3 h-3" style={{ color: ACCENT }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white">{tx.purpose}</p>
                            {tx.recipientName && <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>→ {tx.recipientName}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono font-semibold" style={{ color: tx.type === "fund" ? "#4ade80" : ACCENT }}>
                              {tx.type === "fund" ? "+" : "-"}${parseFloat(tx.amountUsdg).toFixed(4)}
                            </p>
                            {tx.settlementMs && <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>{tx.settlementMs.toFixed(0)}ms</p>}
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
