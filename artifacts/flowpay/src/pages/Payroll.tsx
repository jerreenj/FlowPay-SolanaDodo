import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Users, CheckCircle, Copy, ExternalLink, Zap, TrendingUp, Clock, DollarSign, ArrowRight } from "lucide-react";

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
  pendingCount: number;
}

function truncateSig(sig: string | null) {
  if (!sig) return "—";
  return sig.slice(0, 8) + "…" + sig.slice(-6);
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#38bdf8", "#f472b6", "#a78bfa", "#fb923c", "#4ade80", "#00ff88"];

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const style =
    s === "completed"
      ? { color: ACCENT, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }
      : s === "pending"
      ? { color: "#fbbf24", background: "#fbbf2415", border: "1px solid #fbbf2430" }
      : { color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" };
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={style}>
      {status}
    </span>
  );
}

export default function Payroll() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    senderName: user?.name ?? "",
    senderCompany: "",
    recipientName: "",
    recipientEmail: "",
    amountUsdg: "",
    recipientUpiId: "",
  });
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
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch("/api/payroll/payments", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Payment failed"); return; }
      setSuccess(data);
      setForm({ senderName: user?.name ?? "", senderCompany: "", recipientName: "", recipientEmail: "", amountUsdg: "", recipientUpiId: "" });
      await load();
    } catch {
      setError("Network error — please try again");
    } finally { setSubmitting(false); }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inrPreview = form.amountUsdg ? (parseFloat(form.amountUsdg) * 83.52).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;
  const feePreview = form.amountUsdg ? (parseFloat(form.amountUsdg) * 0.005).toFixed(2) : null;

  return (
    <AppLayout>
      {/* Header + Stats */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 65% 140% at 0% 0%, ${ACCENT}10 0%, transparent 70%)` }} />
        <div className="relative z-10 px-8 pt-8 pb-4">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 20px ${ACCENT}18` }}>
              <Users className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-[clamp(1.35rem,2.5vw,2rem)] font-bold text-white tracking-tight">PayRails</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>0.5% fee</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.10)" }}>Dodo Payments</span>
              </div>
              <p className="text-[13px] sm:text-sm" style={{ color: "rgba(255,255,255,0.56)" }}>
                Stablecoin payroll for remote teams — settled on Solana in &lt;3s, delivered to UPI
              </p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 pb-7">
              {[
                { label: "Total Payments", value: stats.totalPayments.toString(), icon: Users, sub: `${stats.completedCount} completed`, accent: true },
                { label: "Volume (USDG)", value: `$${parseFloat(stats.totalVolume || "0").toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, sub: "stablecoin settled", accent: false },
                { label: "Fees Collected", value: `$${parseFloat(stats.totalFees || "0").toFixed(2)}`, icon: TrendingUp, sub: "0.5% per payment", accent: false },
                { label: "Avg Settlement", value: stats.avgSettlementSeconds ? `${stats.avgSettlementSeconds}s` : "<3s", icon: Zap, sub: "vs SWIFT: 3–5 days", accent: false },
              ].map(({ label, value, icon: Icon, sub, accent }) => (
                <div key={label} className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                    <Icon className="w-3.5 h-3.5" style={{ color: accent ? ACCENT : "rgba(255,255,255,0.2)" }} />
                  </div>
                  <p className="text-[clamp(1.3rem,2vw,1.65rem)] font-bold font-mono leading-none mb-1" style={{ color: accent ? ACCENT : "white" }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — history */}
          <div className="lg:col-span-3 space-y-5">
            {success && (
              <div className="rounded-2xl p-5" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}25` }}>
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">Settled in {success.settlementSeconds}s</p>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {success.recipientName} received{" "}
                      <span className="font-mono text-white">${parseFloat(success.amountUsdg).toLocaleString()}</span> USDG · ₹{parseFloat(success.amountInr).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button onClick={() => setSuccess(null)} className="text-white/20 hover:text-white/50 transition-colors text-xs">✕</button>
                </div>
                {/* Settlement flow */}
                <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-2" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {["Sender Wallet", "Solana ⚡", "UPI / Bank"].map((node, i, arr) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className="flex-1 text-center">
                        <p className="text-[11px] font-mono font-semibold" style={{ color: ACCENT }}>{node}</p>
                      </div>
                      {i < arr.length - 1 && <ArrowRight className="w-3 h-3 shrink-0" style={{ color: `${ACCENT}60` }} />}
                    </div>
                  ))}
                </div>
                {success.solanaSignature && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Sig: {truncateSig(success.solanaSignature)}</span>
                    <button onClick={() => navigator.clipboard.writeText(success.solanaSignature ?? "")} className="text-white/20 hover:text-white/50 transition-colors">
                      <Copy className="w-3 h-3" />
                    </button>
                    {success.dodoCheckoutUrl && (
                      <a href={success.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                        <ExternalLink className="w-3 h-3" /> Dodo Checkout
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <h2 className="text-[13px] font-semibold text-white">Payment History</h2>
                {payments.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <Clock className="w-3 h-3" /> {payments.length} records
                  </span>
                )}
              </div>
              {loading ? (
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />)}
                </div>
              ) : payments.length === 0 ? (
                <div className="py-16 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}20` }}>
                    <Users className="w-5 h-5" style={{ color: `${ACCENT}80` }} />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">No payments yet</p>
                  <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>Fill the form on the right to send your first payroll payment — it settles in under 3 seconds.</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {payments.map((p) => {
                    const ini = initials(p.recipientName);
                    const col = AVATAR_COLORS[p.id % AVATAR_COLORS.length];
                    return (
                      <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: `${col}15`, border: `1px solid ${col}25`, color: col }}>
                          {ini}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white font-medium">{p.recipientName}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {p.senderCompany && `${p.senderCompany} · `}{p.recipientEmail}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-mono font-semibold text-white">${parseFloat(p.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            ₹{parseFloat(p.amountInr).toLocaleString("en-IN")}{p.settlementSeconds ? ` · ${p.settlementSeconds}s` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusPill status={p.status} />
                          {p.dodoCheckoutUrl && (
                            <a href={p.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }} title="Open Dodo Checkout">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {p.solanaSignature && (
                            <button onClick={() => navigator.clipboard.writeText(p.solanaSignature ?? "")} className="transition-colors hover:text-white/50" style={{ color: "rgba(255,255,255,0.18)" }}>
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — always-visible send form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl sticky top-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[13px] font-semibold text-white">Send Payment</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Converts to INR and delivers via UPI</p>
              </div>
              <form onSubmit={handleSend} className="p-5 space-y-3.5">
                {[
                  { key: "senderName", label: "From (Your Name)", placeholder: "Your full name" },
                  { key: "senderCompany", label: "Company", placeholder: "Your company name" },
                  { key: "recipientName", label: "Recipient Name", placeholder: "Full name" },
                  { key: "recipientEmail", label: "Recipient Email", placeholder: "email@example.com", type: "email" },
                  { key: "recipientUpiId", label: "UPI ID (optional)", placeholder: "handle@bank", req: false },
                ].map(({ key, label, placeholder, type, req }) => (
                  <div key={key}>
                    <label className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
                    <input
                      type={type ?? "text"}
                      value={(form as Record<string, string>)[key]}
                      onChange={(e) => set(key, e.target.value)}
                      required={req !== false}
                      placeholder={placeholder}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                      onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                    />
                  </div>
                ))}

                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Amount (USDG)</label>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={form.amountUsdg}
                    onChange={(e) => set("amountUsdg", e.target.value)}
                    required placeholder="0.00"
                    className="w-full mt-1 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all font-mono"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                  />
                  {inrPreview && (
                    <div className="flex items-center justify-between mt-1.5 px-1">
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>≈ ₹{inrPreview} to recipient</span>
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Fee: ${feePreview}</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl px-3 py-2.5 text-sm" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60"
                  style={{ background: ACCENT, color: "#000" }}
                >
                  <Zap className="w-4 h-4" />
                  {submitting ? "Settling on Solana…" : "Send via Dodo + Solana"}
                </button>

                <div className="rounded-xl p-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                  {[
                    "USDG locked on Solana",
                    "Dodo processes the fiat leg",
                    "INR delivered to UPI in <3s",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold" style={{ background: `${ACCENT}20`, color: ACCENT }}>{i + 1}</div>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{step}</p>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
