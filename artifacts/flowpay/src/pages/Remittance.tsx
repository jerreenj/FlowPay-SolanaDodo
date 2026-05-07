import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { useExchangeRates, fmtUpdated } from "@/lib/useExchangeRates";
import { ArrowRightLeft, CheckCircle, Copy, ExternalLink, Zap, ArrowRight, RefreshCw } from "lucide-react";

const ACCENT = "#38bdf8";

const FLAGS: Record<string, string> = { US: "🇺🇸", UAE: "🇦🇪", UK: "🇬🇧", SG: "🇸🇬", CA: "🇨🇦", AU: "🇦🇺", IN: "🇮🇳" };

interface Remittance {
  id: number;
  senderName: string;
  senderCountry: string;
  recipientName: string;
  recipientUpiId: string;
  amountUsdg: string;
  amountInr: string;
  status: string;
  solanaSignature: string | null;
  settlementSeconds: number | null;
  dodoCheckoutUrl: string | null;
  createdAt: string;
}

interface Stats {
  totalRemittances: number;
  totalVolume: string;
  avgSettlementSeconds: number;
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const color = s === "completed" ? ACCENT : s === "pending" ? "#fbbf24" : "rgba(255,255,255,0.35)";
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-mono shrink-0">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span style={{ color }}>{status}</span>
    </span>
  );
}

const CORRIDORS = [
  { flag: "🇦🇪", from: "UAE", label: "UAE → India" },
  { flag: "🇺🇸", from: "US",  label: "US → India" },
  { flag: "🇬🇧", from: "UK",  label: "UK → India" },
];

export default function Remittance() {
  const token = useAuthStore((s) => s.token);
  const user   = useAuthStore((s) => s.user);
  const { rates, loading: ratesLoading } = useExchangeRates();

  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [converterAmt, setConverterAmt] = useState("");
  const [form, setForm] = useState({ senderName: user?.name ?? "", senderCountry: "UAE", recipientName: "", recipientUpiId: "", amountUsdg: "" });
  const [success, setSuccess] = useState<Remittance | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const INR = rates.INR;
  const FEE = 0.0075;

  async function load() {
    try {
      const [r, s] = await Promise.all([
        apiFetch("/api/remittances", { headers: authHeaders }).then((r) => r.json()),
        apiFetch("/api/remittances/stats", { headers: authHeaders }).then((r) => r.json()),
      ]);
      setRemittances(r); setStats(s);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setFormError(null);
    try {
      const res = await apiFetch("/api/remittances", { method: "POST", headers: authHeaders, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSuccess(data);
      setForm({ senderName: user?.name ?? "", senderCountry: "UAE", recipientName: "", recipientUpiId: "", amountUsdg: "" });
      await load();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Error"); }
    finally { setSubmitting(false); }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const convInr = converterAmt && !isNaN(+converterAmt) ? (parseFloat(converterAmt) * INR).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;
  const convFee = converterAmt && !isNaN(+converterAmt) ? (parseFloat(converterAmt) * FEE).toFixed(2) : null;
  const convNet = converterAmt && !isNaN(+converterAmt) ? ((parseFloat(converterAmt) * (1 - FEE)) * INR).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;
  const formInr = form.amountUsdg ? ((parseFloat(form.amountUsdg) * (1 - FEE)) * INR).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;
  const formFee = form.amountUsdg ? (parseFloat(form.amountUsdg) * FEE).toFixed(2) : null;

  return (
    <AppLayout>
      <div className="flex flex-col" style={{ height: "100vh" }}>

        {/* ── Compact header ── */}
        <div className="shrink-0 flex items-center gap-4 pl-14 pr-6 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}28` }}>
            <ArrowRightLeft className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-white">RemitDirect</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>0.75% fee</span>
            </div>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.58)" }}>Cross-border → India in &lt;3 seconds on Solana</p>
          </div>

          {/* Live rate pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}18` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ratesLoading ? "#fbbf24" : ACCENT, boxShadow: ratesLoading ? undefined : `0 0 5px ${ACCENT}` }} />
            <span className="text-[12px] font-mono font-bold" style={{ color: ACCENT }}>
              1 USDG = ₹{INR.toFixed(2)}
            </span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>
              {fmtUpdated(rates.fetchedAt)}
            </span>
            {rates.stale && <span className="text-[10px]" style={{ color: "#fbbf24" }}>est.</span>}
          </div>

          {stats && (
            <div className="ml-auto flex items-center gap-5">
              {[
                { label: "transfers", value: stats.totalRemittances },
                { label: "volume", value: `$${parseFloat(stats.totalVolume || "0").toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                { label: "avg settle", value: stats.avgSettlementSeconds ? `${stats.avgSettlementSeconds}s` : "<3s" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-[18px] font-bold font-mono text-white leading-none">{value}</p>
                  <p className="text-[13px] mt-1 font-semibold capitalize" style={{ color: "rgba(255,255,255,0.62)" }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 2-col content ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left: product showcase ── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* HERO: live converter */}
            <div className="rounded-2xl" style={{ background: `${ACCENT}06`, border: `1px solid ${ACCENT}20` }}>
              <div className="flex items-center justify-between px-5 pt-4 pb-0">
                <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: ACCENT }}>Live Converter</p>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" style={{ color: ACCENT }} />
                  <span className="text-[10px]" style={{ color: ACCENT }}>Updates every 2h</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {/* Send box */}
                <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>You send</p>
                    <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.42)" }}>USDG ≈ $1.00</span>
                  </div>
                  <input
                    type="number" min="0" step="0.01"
                    value={converterAmt}
                    onChange={(e) => setConverterAmt(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-[2rem] font-bold font-mono text-white outline-none placeholder:text-white/20"
                  />
                  {convFee && (
                    <p className="text-[11px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Fee: <span className="font-mono">${convFee}</span> · You send net: <span className="font-mono">{(parseFloat(converterAmt) * (1 - FEE)).toFixed(2)} USDG</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 px-1">
                  <div className="flex-1 h-px" style={{ background: `${ACCENT}20` }} />
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}32` }}>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1 h-px" style={{ background: `${ACCENT}20` }} />
                </div>

                {/* Receive box */}
                <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>🇮🇳 Recipient gets</p>
                    <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.42)" }}>1 USDG = ₹{INR.toFixed(2)}</span>
                  </div>
                  <p className="text-[2rem] font-bold font-mono" style={{ color: convNet ? ACCENT : "rgba(255,255,255,0.18)" }}>
                    ₹{convNet ?? "0"}
                  </p>
                  <p className="text-[11px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Delivered to UPI · <span className="font-mono">settlement &lt;3 seconds on Solana</span>
                  </p>
                </div>

                <button
                  onClick={() => { if (converterAmt) set("amountUsdg", converterAmt); }}
                  disabled={!converterAmt}
                  className="w-full text-[12px] font-bold py-2 rounded-xl transition-all disabled:opacity-40"
                  style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>
                  Use this amount in the send form →
                </button>
              </div>
            </div>

            {/* Corridors */}
            <div className="grid grid-cols-3 gap-3">
              {CORRIDORS.map((c) => (
                <div key={c.from} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-3xl mb-2">{c.flag}</p>
                  <p className="text-[15px] font-bold text-white">{c.label}</p>
                  <p className="text-[14px] mt-1.5 font-mono font-bold" style={{ color: ACCENT }}>₹{INR.toFixed(2)}/USDG</p>
                  <p className="text-[13px] mt-1 font-semibold" style={{ color: "rgba(255,255,255,0.72)" }}>⚡ &lt;3s · 0.75%</p>
                </div>
              ))}
            </div>

            {/* vs banks */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="grid grid-cols-3 px-5 py-2.5 text-[12px] uppercase tracking-widest font-semibold" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span>Method</span><span className="text-center">Settlement</span><span className="text-right">Total Fee</span>
              </div>
              {[
                { m: "SWIFT / Wire", t: "3–5 days", f: "3–7%", win: false },
                { m: "Hawala / Agent", t: "1–2 days", f: "2–4%", win: false },
                { m: "RemitDirect ✓", t: "< 3 seconds", f: "0.75%", win: true },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 items-center px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: row.win ? `${ACCENT}06` : "transparent" }}>
                  <span className="text-[14px] font-semibold" style={{ color: row.win ? "white" : "rgba(255,255,255,0.75)" }}>{row.m}</span>
                  <span className="text-center font-mono text-[14px] font-bold" style={{ color: row.win ? ACCENT : "#f87171" }}>{row.t}</span>
                  <span className="text-right font-mono text-[14px] font-bold" style={{ color: row.win ? ACCENT : "#f87171" }}>{row.f}</span>
                </div>
              ))}
            </div>

            {/* Success banner */}
            {success && (
              <div className="rounded-2xl p-4" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}22` }}>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Settled in {success.settlementSeconds}s</p>
                    <p className="text-[12px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.68)" }}>
                      {FLAGS[success.senderCountry]} {success.senderName} → 🇮🇳 {success.recipientName} · ₹{parseFloat(success.amountInr).toLocaleString("en-IN")}
                    </p>
                    {success.dodoCheckoutUrl && (
                      <a href={success.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold mt-1 inline-flex items-center gap-1" style={{ color: ACCENT }}>
                        Complete via Dodo ↗
                      </a>
                    )}
                  </div>
                  <button onClick={() => setSuccess(null)} style={{ color: "rgba(255,255,255,0.25)" }}>✕</button>
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <p className="text-[12px] uppercase tracking-widest mb-3 px-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>Transfer History</p>
              {remittances.length === 0 ? (
                <div className="rounded-2xl py-10 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ArrowRightLeft className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
                  <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>Use the calculator above and send form → to get started</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  {remittances.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}>
                      <span className="text-xl shrink-0">{FLAGS[r.senderCountry] ?? "🌍"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-white">{r.senderName} <span style={{ color: "rgba(255,255,255,0.55)" }}>→</span> {r.recipientName}</p>
                        <p className="text-[13px] mt-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>{r.senderCountry} → IN · {r.recipientUpiId}{r.settlementSeconds ? ` · ${r.settlementSeconds}s` : ""}</p>
                      </div>
                      <div className="text-right shrink-0 mr-2">
                        <p className="text-[16px] font-mono font-bold text-white">${parseFloat(r.amountUsdg).toFixed(2)}</p>
                        <p className="text-[13px] mt-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.72)" }}>₹{parseFloat(r.amountInr).toLocaleString("en-IN")}</p>
                      </div>
                      <StatusPill status={r.status} />
                      {r.dodoCheckoutUrl && <a href={r.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                      {r.solanaSignature && <button onClick={() => navigator.clipboard.writeText(r.solanaSignature ?? "")} style={{ color: "rgba(255,255,255,0.20)" }}><Copy className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: send form ── */}
          <div className="w-80 shrink-0 border-l overflow-y-auto p-5 space-y-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">Send Remittance</p>
              <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.58)" }}>
                {FLAGS[form.senderCountry] ?? "🌍"} → 🇮🇳 · USDG → Solana → UPI
              </p>
            </div>

            <form onSubmit={handleSend} className="space-y-2.5">
              {(["senderName", "recipientName", "recipientUpiId"] as const).map((k) => (
                <input key={k} value={form[k]} onChange={(e) => set(k, e.target.value)} required
                  placeholder={k === "senderName" ? "Your full name" : k === "recipientName" ? "Recipient name" : "Recipient UPI ID (name@bank)"}
                  className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              ))}

              <select value={form.senderCountry} onChange={(e) => set("senderCountry", e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <option value="UAE">🇦🇪 UAE</option>
                <option value="US">🇺🇸 United States</option>
                <option value="UK">🇬🇧 United Kingdom</option>
                <option value="SG">🇸🇬 Singapore</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="AU">🇦🇺 Australia</option>
              </select>

              <div>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required
                  placeholder="Amount in USDG"
                  className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none font-mono"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                {formInr && (
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <span className="text-[12px] font-bold font-mono" style={{ color: ACCENT }}>≈ ₹{formInr}</span>
                    <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>fee ${formFee}</span>
                  </div>
                )}
              </div>

              {formError && (
                <div className="rounded-xl px-3 py-2 text-[12px] font-medium" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", color: "#f87171" }}>
                  {formError}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-2.5 rounded-xl disabled:opacity-55"
                style={{ background: ACCENT, color: "#000" }}>
                <Zap className="w-3.5 h-3.5" />
                {submitting ? "Settling on Solana…" : "Send Remittance"}
              </button>
            </form>

            {/* Steps */}
            <div className="rounded-xl px-3 py-3 space-y-2" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { n: 1, text: "USDG locked on Solana" },
                { n: 2, text: "Dodo converts to INR" },
                { n: 3, text: "🇮🇳 UPI delivery < 3s" },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-center gap-2.5">
                  <span className="text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: `${ACCENT}22`, color: ACCENT }}>{n}</span>
                  <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.68)" }}>{text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[{ name: "Dodo Payments", desc: "Fiat rails", color: "#f472b6" }, { name: "Solana", desc: "Settlement", color: "#9945ff" }].map(({ name, desc, color }) => (
                <div key={name} className="rounded-xl px-3 py-2 text-center" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                  <p className="text-[11px] font-bold" style={{ color }}>{name}</p>
                  <p className="text-[11px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.52)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
