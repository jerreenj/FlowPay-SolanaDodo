import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Bot, Plus, Zap, ArrowUpRight, ArrowDownLeft, Copy, X, Activity } from "lucide-react";

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
  type: string;
  recipientName: string | null;
  amountUsdg: string;
  purpose: string;
  solanaSignature: string | null;
  settlementMs: number | null;
  dodoCheckoutUrl: string | null;
  createdAt: string;
}

const X402_FLOW = [
  { req: "GET /api/data", res: "402 Payment Required", note: "Agent requests a paid resource", reqColor: "rgba(255,255,255,0.65)", resColor: "#f87171" },
  { req: "POST /x402/pay  0.001 USDG", res: "TX: Solana ⚡ confirmed", note: "FlowPay sends micro-payment on-chain", reqColor: ACCENT, resColor: "#4ade80" },
  { req: "GET /api/data  X-Payment-Proof", res: "200 OK  { data… }", note: "API verifies proof and returns response", reqColor: "rgba(255,255,255,0.65)", resColor: "#4ade80" },
];

const inp = "w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none";
const inpSt = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" };
const onFo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = `${ACCENT}55`);
const onBl = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "rgba(255,255,255,0.09)");

export default function Agents() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [txs, setTxs] = useState<Record<number, Tx[]>>({});
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [action, setAction] = useState<"fund" | "pay" | "history" | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", ownerName: user?.name ?? "", x402Enabled: false });
  const [fundAmount, setFundAmount] = useState("");
  const [payForm, setPayForm] = useState({ recipientName: "", recipientAddress: "", amountUsdg: "", purpose: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try { setAgents(await apiFetch("/api/agents", { headers: authHeaders }).then((r) => r.json())); }
    catch {}
    finally { setLoading(false); }
  }

  async function loadTxs(id: number) {
    const data = await apiFetch(`/api/agents/${id}/transactions`, { headers: authHeaders }).then((r) => r.json());
    setTxs((t) => ({ ...t, [id]: data }));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setFormError(null);
    try {
      const res = await apiFetch("/api/agents", { method: "POST", headers: authHeaders, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setShowForm(false); setForm({ name: "", description: "", ownerName: user?.name ?? "", x402Enabled: false });
      await load();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Error"); }
    finally { setSubmitting(false); }
  }

  async function handleFund(id: number) {
    setSubmitting(true); setActionError(null);
    try {
      const res = await apiFetch(`/api/agents/${id}/fund`, { method: "POST", headers: authHeaders, body: JSON.stringify({ amountUsdg: fundAmount }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setAction(null); setFundAmount(""); await load();
      if (txs[id]) loadTxs(id);
    } catch (e) { setActionError(e instanceof Error ? e.message : "Error"); }
    finally { setSubmitting(false); }
  }

  async function handlePay(id: number) {
    setSubmitting(true); setActionError(null);
    try {
      const res = await apiFetch(`/api/agents/${id}/pay`, { method: "POST", headers: authHeaders, body: JSON.stringify(payForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setAction(null); setPayForm({ recipientName: "", recipientAddress: "", amountUsdg: "", purpose: "" });
      await load(); if (txs[id]) loadTxs(id);
    } catch (e) { setActionError(e instanceof Error ? e.message : "Error"); }
    finally { setSubmitting(false); }
  }

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const totalBalance = agents.reduce((s, a) => s + parseFloat(a.usdgBalance || "0"), 0);
  const activeCount = agents.filter((a) => a.isActive === "true").length;
  const totalTxs = agents.reduce((s, a) => s + a.transactionCount, 0);

  return (
    <AppLayout>
      <div className="flex flex-col" style={{ height: "100vh" }}>
        {/* ── Compact header ── */}
        <div className="shrink-0 flex items-center gap-4 pl-14 pr-6 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
            <Bot className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-white">AgentBank</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>1% fee</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.09)" }}>x402</span>
            </div>
            <p className="text-[11px] leading-tight font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>AI agent wallets on Solana · machine-to-machine payments</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {[
              { label: "agents", value: agents.length },
              { label: "active", value: activeCount },
              { label: "USDG held", value: `$${totalBalance.toFixed(2)}` },
              { label: "transactions", value: totalTxs },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[18px] font-bold font-mono text-white leading-none">{value}</p>
                <p className="text-[13px] mt-1 font-semibold capitalize" style={{ color: "rgba(255,255,255,0.62)" }}>{label}</p>
              </div>
            ))}
            <button onClick={() => { setShowForm(true); setFormError(null); }} className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-2 rounded-xl ml-2" style={{ background: ACCENT, color: "#000" }}>
              <Plus className="w-3.5 h-3.5" /> Deploy
            </button>
          </div>
        </div>

        {/* ── 2-col ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left — x402 explainer + agents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* x402 Protocol explainer */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${ACCENT}22` }}>
              <div className="flex items-center gap-2.5 px-5 py-3" style={{ borderBottom: `1px solid ${ACCENT}18`, background: `${ACCENT}06` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />
                <p className="text-[11px] font-semibold" style={{ color: ACCENT }}>x402 Protocol — How Agents Pay APIs Autonomously</p>
              </div>
              <div className="p-5 space-y-3">
                {X402_FLOW.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5" style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <code className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.07)", color: step.reqColor }}>{step.req}</code>
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>→</span>
                        <code className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: `${step.resColor}10`, color: step.resColor, border: `1px solid ${step.resColor}25` }}>{step.res}</code>
                      </div>
                      <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.68)" }}>{step.note}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[12px] font-medium pt-3 mt-1" style={{ color: "rgba(255,255,255,0.62)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  Agents with x402 enabled autonomously pay for API access — no human interaction required. Sub-second via Solana.
                </p>
              </div>
            </div>

            {/* Agent cards */}
            <div>
              <p className="text-[11px] uppercase tracking-widest mb-3 px-1" style={{ color: "rgba(255,255,255,0.3)" }}>Deployed Agents</p>
              {loading ? (
                [...Array(2)].map((_, i) => <div key={i} className="h-48 rounded-2xl mb-3 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />)
              ) : agents.length === 0 ? (
                <div className="rounded-2xl py-12 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Bot className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.12)" }} />
                  <p className="text-[15px] font-semibold text-white mb-1">No agents deployed</p>
                  <p className="text-sm max-w-sm mx-auto font-medium" style={{ color: "rgba(255,255,255,0.60)" }}>Deploy an AI agent using the form → — it gets a Solana wallet and can autonomously pay for APIs via x402.</p>
                </div>
              ) : agents.map((agent) => {
                const isActive = agent.isActive === "true";
                const has402 = agent.x402Enabled === "true";
                const sel = selectedAgent?.id === agent.id;
                return (
                  <div key={agent.id} className="rounded-2xl overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                              <Bot className="w-5 h-5" style={{ color: ACCENT }} />
                            </div>
                            {isActive && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#070707] animate-pulse" style={{ background: "#4ade80" }} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[14px] font-semibold text-white">{agent.name}</span>
                              {has402 && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}22` }}>x402</span>}
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={isActive ? { background: "#4ade8015", color: "#4ade80", border: "1px solid #4ade8022" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.09)" }}>
                                {isActive ? "● active" : "inactive"}
                              </span>
                            </div>
                            <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.68)" }}>Owner: {agent.ownerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold font-mono" style={{ color: ACCENT }}>${parseFloat(agent.usdgBalance).toFixed(2)}</p>
                          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>USDG balance</p>
                        </div>
                      </div>

                      <p className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>{agent.description}</p>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          { label: "Paid", value: `$${parseFloat(agent.totalPaid).toFixed(2)}` },
                          { label: "Received", value: `$${parseFloat(agent.totalReceived).toFixed(2)}` },
                          { label: "Txns", value: agent.transactionCount },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                            <p className="text-[12px] font-mono font-semibold text-white">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{agent.walletAddress.slice(0, 8)}…{agent.walletAddress.slice(-6)}</span>
                          <button onClick={() => navigator.clipboard.writeText(agent.walletAddress)} style={{ color: "rgba(255,255,255,0.18)" }}><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="flex gap-1.5">
                          {[
                            { label: "Fund", icon: ArrowDownLeft, act: "fund" as const },
                            { label: "Pay", icon: ArrowUpRight, act: "pay" as const },
                            { label: "History", icon: Activity, act: "history" as const },
                          ].map(({ label, icon: Icon, act }) => (
                            <button key={act} onClick={() => { setSelectedAgent(agent); setAction(sel && action === act ? null : act); setActionError(null); if (act === "history" && !txs[agent.id]) loadTxs(agent.id); }}
                              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all"
                              style={sel && action === act ? { background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}28` } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                              <Icon className="w-3 h-3" /> {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Fund panel */}
                    {sel && action === "fund" && (
                      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Fund Agent Wallet</p>
                        <div className="flex gap-2">
                          <input type="number" min="0.01" step="0.01" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder="Amount in USDG"
                            className="flex-1 rounded-xl px-3 py-2 text-white text-[13px] outline-none font-mono"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                            onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                          <button onClick={() => handleFund(agent.id)} disabled={submitting || !fundAmount} className="text-[12px] font-bold px-4 py-2 rounded-xl disabled:opacity-50" style={{ background: ACCENT, color: "#000" }}>
                            {submitting ? "…" : "Fund"}
                          </button>
                          <button onClick={() => setAction(null)} className="px-3 py-2 text-[13px] rounded-xl" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>✕</button>
                        </div>
                        {actionError && <p className="mt-2 text-[12px] px-3 py-2 rounded-lg" style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}>{actionError}</p>}
                      </div>
                    )}

                    {/* Pay panel */}
                    {sel && action === "pay" && (
                      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Execute Payment</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {[
                            { k: "recipientName", ph: "Recipient name" },
                            { k: "recipientAddress", ph: "Wallet address" },
                            { k: "amountUsdg", ph: "Amount (USDG)", type: "number" },
                            { k: "purpose", ph: "Purpose / memo" },
                          ].map(({ k, ph, type }) => (
                            <input key={k} type={type ?? "text"} value={(payForm as Record<string, string>)[k]}
                              onChange={(e) => setPayForm((f) => ({ ...f, [k]: e.target.value }))} placeholder={ph}
                              className="rounded-xl px-3 py-2 text-white text-[12px] outline-none"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                              onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                          ))}
                        </div>
                        {actionError && <p className="mb-2 text-[12px] px-3 py-2 rounded-lg" style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}>{actionError}</p>}
                        <div className="flex gap-2">
                          <button onClick={() => handlePay(agent.id)} disabled={submitting || !payForm.recipientName || !payForm.amountUsdg || !payForm.purpose}
                            className="flex-1 text-[12px] font-bold py-2 rounded-xl disabled:opacity-50" style={{ background: ACCENT, color: "#000" }}>
                            {submitting ? "Sending…" : "Execute"}
                          </button>
                          <button onClick={() => setAction(null)} className="px-3 py-2 text-[13px] rounded-xl" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>✕</button>
                        </div>
                      </div>
                    )}

                    {/* History panel */}
                    {sel && action === "history" && txs[agent.id] && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="px-4 py-2.5 text-[10px] uppercase tracking-widest" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.01)" }}>Transaction Log</p>
                        <div className="max-h-48 overflow-y-auto divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          {txs[agent.id].length === 0 ? (
                            <p className="px-4 py-6 text-[12px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>No transactions yet</p>
                          ) : txs[agent.id].map((tx) => (
                            <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                              <div className="p-1.5 rounded-lg shrink-0" style={{ background: tx.type === "fund" ? "rgba(74,222,128,0.1)" : `${ACCENT}10` }}>
                                {tx.type === "fund" ? <ArrowDownLeft className="w-3 h-3" style={{ color: "#4ade80" }} /> : <ArrowUpRight className="w-3 h-3" style={{ color: ACCENT }} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] text-white">{tx.purpose}</p>
                                {tx.recipientName && <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>→ {tx.recipientName}</p>}
                                {tx.dodoCheckoutUrl && <a href={tx.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] underline underline-offset-2" style={{ color: ACCENT }}>Pay via Dodo ↗</a>}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[12px] font-mono font-semibold" style={{ color: tx.type === "fund" ? "#4ade80" : ACCENT }}>
                                  {tx.type === "fund" ? "+" : "-"}${parseFloat(tx.amountUsdg).toFixed(2)}
                                </p>
                                {tx.settlementMs && <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{tx.settlementMs}ms</p>}
                              </div>
                              {tx.solanaSignature && <button onClick={() => navigator.clipboard.writeText(tx.solanaSignature ?? "")} style={{ color: "rgba(255,255,255,0.15)" }}><Copy className="w-3 h-3" /></button>}
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

          {/* Right — deploy form */}
          <div className="w-80 shrink-0 overflow-y-auto border-l p-5 space-y-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {showForm ? (
              <>
                <div className="flex justify-between items-start">
                  <div><p className="text-[13px] font-bold text-white mb-0.5">Deploy Agent</p><p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Gets a Solana wallet + Dodo integration</p></div>
                  <button onClick={() => { setShowForm(false); setFormError(null); }} style={{ color: "rgba(255,255,255,0.3)" }}><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-2.5">
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Agent name (e.g. InvoiceBot)"
                    className={inp} style={inpSt} onFocus={onFo} onBlur={onBl} />
                  <input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} required placeholder="Owner / team name"
                    className={inp} style={inpSt} onFocus={onFo} onBlur={onBl} />
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={3}
                    placeholder="What does this agent do? (e.g. 'Pays API providers autonomously')"
                    className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none resize-none"
                    style={inpSt} onFocus={onFo} onBlur={onBl} />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative w-9 h-5 rounded-full transition-all shrink-0" style={{ background: form.x402Enabled ? ACCENT : "rgba(255,255,255,0.12)" }}
                      onClick={() => set("x402Enabled", !form.x402Enabled)}>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: form.x402Enabled ? "translateX(16px)" : "translateX(0)" }} />
                    </div>
                    <div>
                      <p className="text-[12px] text-white">Enable x402 Protocol</p>
                      <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Autonomous API micro-payments</p>
                    </div>
                  </label>
                  {formError && <div className="rounded-xl px-3 py-2 text-[12px]" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", color: "#f87171" }}>{formError}</div>}
                  <button type="submit" disabled={submitting} className="w-full text-[13px] font-bold py-2.5 rounded-xl disabled:opacity-60" style={{ background: ACCENT, color: "#000" }}>
                    {submitting ? "Deploying on Solana…" : "Deploy Agent"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[13px] font-bold text-white mb-0.5">AgentBank</p>
                  <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Deploy AI agents with autonomous payment capabilities</p>
                </div>
                <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-2.5 rounded-xl" style={{ background: ACCENT, color: "#000" }}>
                  <Plus className="w-4 h-4" /> Deploy New Agent
                </button>
                {/* Use cases */}
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>What agents can do</p>
                  {[
                    { icon: "🔁", title: "Auto-pay APIs", desc: "Pay HTTP 402 endpoints autonomously via x402" },
                    { icon: "📤", title: "Batch payouts", desc: "Distribute earnings to team wallets on schedule" },
                    { icon: "🤖", title: "AI pipelines", desc: "Fund LLM API calls, embeddings, and inference" },
                    { icon: "💹", title: "DeFi actions", desc: "Execute swaps and liquidity provision on-chain" },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-lg shrink-0">{icon}</span>
                      <div>
                        <p className="text-[12px] font-semibold text-white">{title}</p>
                        <p className="text-[12px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.68)" }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Dodo Payments", desc: "Fiat integration", color: "#f472b6" },
                    { name: "Solana", desc: "Settlement layer", color: "#9945ff" },
                  ].map(({ name, desc, color }) => (
                    <div key={name} className="rounded-xl px-3 py-2 text-center" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                      <p className="text-[11px] font-semibold" style={{ color }}>{name}</p>
                      <p className="text-[11px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
