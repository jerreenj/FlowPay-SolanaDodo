import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Users, CheckCircle, Copy, ExternalLink, Zap, TrendingUp, ArrowRight, DollarSign, Clock } from "lucide-react";

const ACCENT = "#00ff88";

interface Payment {
  id: number;
  senderName: string;
  senderCompany: string;
  recipientName: string;
  recipientEmail: string;
  amountUsdg: string;
  feeUsdg: string;
  amountInr: string;
  status: string;
  solanaSignature: string | null;
  settlementSeconds: number | null;
  dodoPaymentId: string | null;
  dodoCheckoutUrl: string | null;
  createdAt: string;
}

interface Stats {
  totalPayments: number;
  totalVolume: string;
  totalFees: string;
  avgSettlementSeconds: number;
  completedCount: number;
}

const AVATAR_COLORS = ["#38bdf8", "#f472b6", "#a78bfa", "#fb923c", "#4ade80", ACCENT];
const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function StatusDot({ status }: { status: string }) {
  const s = status.toLowerCase();
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-mono">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s === "completed" ? ACCENT : s === "pending" ? "#fbbf24" : "rgba(255,255,255,0.3)" }} />
      <span style={{ color: s === "completed" ? ACCENT : s === "pending" ? "#fbbf24" : "rgba(255,255,255,0.4)" }}>{status}</span>
    </span>
  );
}

const FLOW_NODES = [
  { icon: "💼", label: "USDG Locked", sub: "Your wallet", color: ACCENT },
  { icon: "⚡", label: "Solana Network", sub: "< 3 seconds", color: "#a78bfa" },
  { icon: "📲", label: "UPI Delivered", sub: "Bank account", color: "#38bdf8" },
];

const COMPARE = [
  { method: "Traditional Wire", time: "3–5 days", fee: "3–7%", win: false },
  { method: "Payroll Software", time: "T+1 day", fee: "2–3%", win: false },
  { method: "PayRails (Solana)", time: "< 3 seconds", fee: "0.5%", win: true },
];

export default function Payroll() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ senderName: user?.name ?? "", senderCompany: "", recipientName: "", recipientEmail: "", amountUsdg: "", recipientUpiId: "" });
  const [success, setSuccess] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const [p, s] = await Promise.all([
        apiFetch("/api/payroll/payments", { headers: authHeaders }).then((r) => r.json()),
        apiFetch("/api/payroll/stats", { headers: authHeaders }).then((r) => r.json()),
      ]);
      setPayments(p);
      setStats(s);
    } catch {}
  }

  useEffect(() => { load(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch("/api/payroll/payments", { method: "POST", headers: authHeaders, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Payment failed"); return; }
      setSuccess(data);
      setForm({ senderName: user?.name ?? "", senderCompany: "", recipientName: "", recipientEmail: "", amountUsdg: "", recipientUpiId: "" });
      await load();
    } catch { setError("Network error"); }
    finally { setSubmitting(false); }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inrPreview = form.amountUsdg ? (parseFloat(form.amountUsdg) * 83.52).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;
  const feePreview = form.amountUsdg ? (parseFloat(form.amountUsdg) * 0.005).toFixed(2) : null;

  return (
    <AppLayout>
      <div className="flex flex-col" style={{ height: "100vh" }}>
        {/* ── Compact header ── */}
        <div className="shrink-0 flex items-center gap-4 px-6 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
            <Users className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-white">PayRails</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>0.5% fee</span>
            </div>
            <p className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.45)" }}>Stablecoin payroll → UPI delivery in &lt;3s</p>
          </div>
          {stats && (
            <div className="ml-auto flex items-center gap-5">
              {[
                { label: "payments", value: stats.totalPayments },
                { label: "volume", value: `$${parseFloat(stats.totalVolume || "0").toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                { label: "avg settle", value: stats.avgSettlementSeconds ? `${stats.avgSettlementSeconds}s` : "<3s" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-[14px] font-bold font-mono text-white leading-none">{value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 2-col content ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left — product showcase */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* How it works */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>How PayRails Works</p>
              <div className="flex items-center gap-2">
                {FLOW_NODES.map((node, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2" style={{ background: `${node.color}12`, border: `1px solid ${node.color}25` }}>
                        {node.icon}
                      </div>
                      <p className="text-[12px] font-semibold text-white text-center">{node.label}</p>
                      <p className="text-[10px] text-center mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{node.sub}</p>
                    </div>
                    {i < FLOW_NODES.length - 1 && (
                      <div className="shrink-0 flex flex-col items-center gap-1">
                        <ArrowRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* vs comparison */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-5 py-3 grid grid-cols-3 text-[10px] uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)" }}>
                <span>Method</span><span className="text-center">Settlement</span><span className="text-right">Fee</span>
              </div>
              {COMPARE.map((c, i) => (
                <div key={i} className="px-5 py-3 grid grid-cols-3 items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: c.win ? `${ACCENT}06` : "transparent" }}>
                  <span className="text-sm font-medium" style={{ color: c.win ? "white" : "rgba(255,255,255,0.5)" }}>{c.win && <span className="mr-1.5">✓</span>}{c.method}</span>
                  <span className="text-center font-mono text-sm" style={{ color: c.win ? ACCENT : "#f87171" }}>{c.time}</span>
                  <span className="text-right font-mono text-sm" style={{ color: c.win ? ACCENT : "#f87171" }}>{c.fee}</span>
                </div>
              ))}
            </div>

            {/* Payment history */}
            <div>
              <p className="text-[11px] uppercase tracking-widest mb-3 px-1" style={{ color: "rgba(255,255,255,0.3)" }}>Payment History</p>
              {success && (
                <div className="rounded-2xl p-4 mb-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}22` }}>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-semibold">Settled in {success.settlementSeconds}s</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {success.recipientName} · ${parseFloat(success.amountUsdg).toLocaleString()} USDG → ₹{parseFloat(success.amountInr).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {success.dodoCheckoutUrl && (
                        <a href={success.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                          Pay via Dodo ↗
                        </a>
                      )}
                      <button onClick={() => setSuccess(null)} className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>✕</button>
                    </div>
                  </div>
                </div>
              )}
              {payments.length === 0 ? (
                <div className="rounded-2xl py-10 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Send your first payroll payment using the form →</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  {payments.map((p, i) => {
                    const col = AVATAR_COLORS[p.id % AVATAR_COLORS.length];
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025]" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[11px] font-bold" style={{ background: `${col}15`, border: `1px solid ${col}22`, color: col }}>
                          {initials(p.recipientName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white font-medium">{p.recipientName}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{p.senderCompany || p.recipientEmail}</p>
                        </div>
                        <div className="text-right shrink-0 mr-2">
                          <p className="text-[13px] font-mono font-semibold text-white">${parseFloat(p.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>₹{parseFloat(p.amountInr).toLocaleString("en-IN")}{p.settlementSeconds ? ` · ${p.settlementSeconds}s` : ""}</p>
                        </div>
                        <StatusDot status={p.status} />
                        {p.dodoCheckoutUrl && (
                          <a href={p.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {p.solanaSignature && (
                          <button onClick={() => navigator.clipboard.writeText(p.solanaSignature ?? "")} style={{ color: "rgba(255,255,255,0.18)" }}>
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — compact send form */}
          <div className="w-80 shrink-0 overflow-y-auto border-l p-5 space-y-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">Send Payroll</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>USDG → Solana → UPI / Bank</p>
            </div>

            <form onSubmit={handleSend} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { k: "senderName", ph: "Your name" },
                  { k: "senderCompany", ph: "Company", req: false },
                ].map(({ k, ph, req }) => (
                  <input key={k} value={(form as Record<string, string>)[k]} onChange={(e) => set(k, e.target.value)}
                    required={req !== false} placeholder={ph}
                    className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { k: "recipientName", ph: "Recipient name" },
                  { k: "recipientEmail", ph: "Email", type: "email" },
                ].map(({ k, ph, type }) => (
                  <input key={k} type={type ?? "text"} value={(form as Record<string, string>)[k]} onChange={(e) => set(k, e.target.value)}
                    required placeholder={ph}
                    className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                ))}
              </div>

              <input value={form.recipientUpiId} onChange={(e) => set("recipientUpiId", e.target.value)} placeholder="UPI ID (optional, e.g. name@bank)"
                className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />

              <div>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)}
                  required placeholder="Amount in USDG"
                  className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none font-mono"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                {inrPreview && (
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <span className="text-[11px]" style={{ color: ACCENT }}>≈ ₹{inrPreview}</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>fee ${feePreview}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl px-3 py-2 text-[12px]" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", color: "#f87171" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-2.5 rounded-xl transition-all disabled:opacity-60"
                style={{ background: ACCENT, color: "#000" }}>
                <Zap className="w-3.5 h-3.5" />
                {submitting ? "Settling on Solana…" : "Send via Dodo + Solana"}
              </button>
            </form>

            {/* Dodo + Solana badges */}
            <div className="pt-1 space-y-2">
              <div className="rounded-xl px-3 py-2.5 space-y-1.5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {["USDG locked on Solana", "Dodo processes fiat leg", "INR to UPI in <3s"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>{i + 1}</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>powered by</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Dodo Payments", desc: "Fiat rails", color: "#f472b6" },
                  { name: "Solana", desc: "Settlement layer", color: "#9945ff" },
                ].map(({ name, desc, color }) => (
                  <div key={name} className="rounded-xl px-3 py-2 text-center" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                    <p className="text-[11px] font-semibold" style={{ color }}>{name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
