import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { ArrowRightLeft, CheckCircle, Copy, Globe, ExternalLink, Zap, TrendingDown, Clock, ArrowRight } from "lucide-react";

const ACCENT = "#38bdf8";

const CORRIDORS = [
  { country: "UAE", flag: "🇦🇪", rate: 83.52, currency: "AED", aed: 3.67, code: "UAE" },
  { country: "United States", flag: "🇺🇸", rate: 83.52, currency: "USD", code: "US" },
  { country: "United Kingdom", flag: "🇬🇧", rate: 83.52, currency: "GBP", gbp: 0.79, code: "UK" },
];

const countryFlags: Record<string, string> = {
  US: "🇺🇸", UAE: "🇦🇪", UK: "🇬🇧", SG: "🇸🇬", CA: "🇨🇦", AU: "🇦🇺", IN: "🇮🇳",
};

interface Remittance {
  id: number;
  senderName: string;
  senderCountry: string;
  recipientName: string;
  recipientUpiId: string;
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
  totalRemittances: number;
  totalVolume: string;
  totalFees: string;
  avgSettlementSeconds: number;
  corridors: { country: string; count: number; volume: string }[];
}

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

export default function Remittance() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    senderName: user?.name ?? "",
    senderCountry: "UAE",
    recipientName: "",
    recipientUpiId: "",
    amountUsdg: "",
  });
  const [success, setSuccess] = useState<Remittance | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const [r, s] = await Promise.all([
        apiFetch("/api/remittances", { headers: authHeaders }).then((r) => r.json()),
        apiFetch("/api/remittances/stats", { headers: authHeaders }).then((r) => r.json()),
      ]);
      setRemittances(r);
      setStats(s);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await apiFetch("/api/remittances", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSuccess(data);
      setForm({ senderName: user?.name ?? "", senderCountry: "UAE", recipientName: "", recipientUpiId: "", amountUsdg: "" });
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setSubmitting(false); }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inrPreview = form.amountUsdg ? (parseFloat(form.amountUsdg) * 83.52).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;
  const feePreview = form.amountUsdg ? (parseFloat(form.amountUsdg) * 0.0075).toFixed(2) : null;
  const selectedFlag = countryFlags[form.senderCountry] ?? "🌍";

  return (
    <AppLayout>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 65% 140% at 0% 0%, ${ACCENT}10 0%, transparent 70%)` }} />
        <div className="relative z-10 px-8 pt-8 pb-4">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 20px ${ACCENT}18` }}>
              <ArrowRightLeft className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-[clamp(1.35rem,2.5vw,2rem)] font-bold text-white tracking-tight">RemitDirect</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>0.75% fee</span>
              </div>
              <p className="text-[13px] sm:text-sm" style={{ color: "rgba(255,255,255,0.56)" }}>
                Cross-border remittances to India — Dubai → Mumbai in under 3 seconds
              </p>
            </div>
          </div>

          {/* Live rate strip */}
          <div className="rounded-2xl overflow-hidden mb-5" style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${ACCENT}20` }}>
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: `${ACCENT}15` }}>
              {CORRIDORS.map((c) => (
                <div key={c.code} className="px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{c.flag} {c.country} → 🇮🇳 India</p>
                  <p className="text-[15px] font-bold font-mono text-white">₹83.52 <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>/ USDG</span></p>
                  <p className="text-[10px] mt-0.5 font-mono" style={{ color: ACCENT }}>⚡ &lt;3s settlement</p>
                </div>
              ))}
            </div>
          </div>

          {/* vs-banks callout */}
          <div className="grid grid-cols-3 gap-3 pb-7">
            {[
              { method: "SWIFT / Wire", time: "3–5 days", fee: "3–7%", bad: true },
              { method: "Hawala / Cash", time: "1–2 days", fee: "2–4%", bad: true },
              { method: "FlowPay + Solana", time: "<3 seconds", fee: "0.75%", bad: false },
            ].map(({ method, time, fee, bad }) => (
              <div key={method} className="rounded-xl px-4 py-3 relative" style={{ background: bad ? "rgba(255,255,255,0.02)" : `${ACCENT}08`, border: `1px solid ${bad ? "rgba(255,255,255,0.07)" : `${ACCENT}25`}` }}>
                {!bad && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />}
                <p className="text-[11px] font-semibold mb-1.5" style={{ color: bad ? "rgba(255,255,255,0.45)" : "white" }}>{method}</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Time</p>
                    <p className="text-[13px] font-mono font-bold" style={{ color: bad ? "#f87171" : ACCENT }}>{time}</p>
                  </div>
                  <div>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Fee</p>
                    <p className="text-[13px] font-mono font-bold" style={{ color: bad ? "#f87171" : ACCENT }}>{fee}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8">
        {stats && (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Remittances", value: stats.totalRemittances.toString(), accent: true },
              { label: "Volume (USDG)", value: `$${parseFloat(stats.totalVolume || "0").toLocaleString(undefined, { maximumFractionDigits: 0 })}`, accent: false },
              { label: "Fees Collected", value: `$${parseFloat(stats.totalFees || "0").toFixed(2)}`, accent: false },
              { label: "Avg Settlement", value: stats.avgSettlementSeconds ? `${stats.avgSettlementSeconds}s` : "<3s", accent: false },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                <p className="text-[clamp(1.3rem,2vw,1.65rem)] font-bold font-mono leading-none" style={{ color: accent ? ACCENT : "white" }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — history */}
          <div className="lg:col-span-3 space-y-5">
            {success && (
              <div className="rounded-2xl p-5" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}25` }}>
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  <div className="flex-1">
                    <p className="text-white font-semibold">Remittance settled in {success.settlementSeconds}s</p>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {success.senderName} ({countryFlags[success.senderCountry]} {success.senderCountry}) → {success.recipientName} · ₹{parseFloat(success.amountInr).toLocaleString("en-IN")} to {success.recipientUpiId}
                    </p>
                  </div>
                  <button onClick={() => setSuccess(null)} className="text-white/20 hover:text-white/50 transition-colors text-xs">✕</button>
                </div>
                <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-2" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {[`${selectedFlag} Sender`, "⚡ Solana", "🇮🇳 UPI"].map((node, i, arr) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className="flex-1 text-center">
                        <p className="text-[11px] font-mono font-semibold" style={{ color: ACCENT }}>{node}</p>
                      </div>
                      {i < arr.length - 1 && <ArrowRight className="w-3 h-3 shrink-0" style={{ color: `${ACCENT}60` }} />}
                    </div>
                  ))}
                </div>
                {success.dodoCheckoutUrl && (
                  <a href={success.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium mt-3 underline underline-offset-2"
                    style={{ color: ACCENT }}>
                    Complete payment via Dodo ↗
                  </a>
                )}
              </div>
            )}

            {stats?.corridors && stats.corridors.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Active Corridors → India</p>
                <div className="flex flex-wrap gap-2">
                  {stats.corridors.map((c) => (
                    <div key={c.country} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}18` }}>
                      <span>{countryFlags[c.country] ?? <Globe className="w-3 h-3" />}</span>
                      <span className="text-xs text-white font-medium">{c.country}</span>
                      <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{c.count} tx · ${parseFloat(c.volume).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <h2 className="text-[13px] font-semibold text-white">Transfer History</h2>
                {remittances.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <Clock className="w-3 h-3" /> {remittances.length} transfers
                  </span>
                )}
              </div>
              {loading ? (
                <div>{[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />)}</div>
              ) : remittances.length === 0 ? (
                <div className="py-16 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}20` }}>
                    <ArrowRightLeft className="w-5 h-5" style={{ color: `${ACCENT}80` }} />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">No transfers yet</p>
                  <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>Use the form to send your first cross-border remittance — settles in under 3 seconds.</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {remittances.map((r) => (
                    <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                      <div className="text-2xl shrink-0">{countryFlags[r.senderCountry] ?? "🌍"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white font-medium">{r.senderName} → {r.recipientName}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {r.senderCountry} → IN · {r.recipientUpiId}{r.settlementSeconds ? ` · ${r.settlementSeconds}s` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-mono font-semibold text-white">${parseFloat(r.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>₹{parseFloat(r.amountInr).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusPill status={r.status} />
                        {r.dodoCheckoutUrl && (
                          <a href={r.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }} title="Pay via Dodo">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {r.solanaSignature && (
                          <button onClick={() => navigator.clipboard.writeText(r.solanaSignature ?? "")} className="transition-colors hover:text-white/50" style={{ color: "rgba(255,255,255,0.18)" }}>
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl sticky top-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[13px] font-semibold text-white">Send Remittance</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>USDG → Solana → INR to UPI</p>
              </div>
              <form onSubmit={handleSend} className="p-5 space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Your Name</label>
                  <input value={form.senderName} onChange={(e) => set("senderName", e.target.value)} required placeholder="Full name"
                    className="w-full mt-1 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Sending From</label>
                  <select value={form.senderCountry} onChange={(e) => set("senderCountry", e.target.value)}
                    className="w-full mt-1 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    <option value="UAE">🇦🇪 UAE</option>
                    <option value="US">🇺🇸 United States</option>
                    <option value="UK">🇬🇧 United Kingdom</option>
                    <option value="SG">🇸🇬 Singapore</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="AU">🇦🇺 Australia</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Recipient Name</label>
                  <input value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} required placeholder="Full name in India"
                    className="w-full mt-1 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Recipient UPI ID</label>
                  <input value={form.recipientUpiId} onChange={(e) => set("recipientUpiId", e.target.value)} required placeholder="handle@bank"
                    className="w-full mt-1 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Amount (USDG)</label>
                  <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="0.00"
                    className="w-full mt-1 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all font-mono"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                  {inrPreview && (
                    <div className="flex items-center justify-between mt-1.5 px-1">
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Recipient gets ≈ ₹{inrPreview}</span>
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Fee: ${feePreview}</span>
                    </div>
                  )}
                </div>

                {formError && (
                  <div className="rounded-xl px-3 py-2.5 text-sm" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                    {formError}
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60"
                  style={{ background: ACCENT, color: "#000" }}>
                  <Zap className="w-4 h-4" />
                  {submitting ? "Settling on Solana…" : "Send Remittance"}
                </button>

                <div className="rounded-xl p-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                  {[
                    `${selectedFlag} → USDG locked on Solana`,
                    "Dodo processes the fiat conversion",
                    "🇮🇳 INR delivered to UPI in <3s",
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
