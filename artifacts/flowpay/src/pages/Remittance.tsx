import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { ArrowRightLeft, CheckCircle, Copy, ExternalLink, Zap, ArrowRight } from "lucide-react";

const ACCENT = "#38bdf8";

const CORRIDORS = [
  { code: "UAE", flag: "🇦🇪", label: "UAE → India", feeUsd: 0.0075 },
  { code: "US",  flag: "🇺🇸", label: "US → India",  feeUsd: 0.0075 },
  { code: "UK",  flag: "🇬🇧", label: "UK → India",  feeUsd: 0.0075 },
];

const FLAGS: Record<string, string> = { US: "🇺🇸", UAE: "🇦🇪", UK: "🇬🇧", SG: "🇸🇬", CA: "🇨🇦", AU: "🇦🇺", IN: "🇮🇳" };
const INR_RATE = 83.52;

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

function StatusDot({ status }: { status: string }) {
  const s = status.toLowerCase();
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-mono">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s === "completed" ? ACCENT : s === "pending" ? "#fbbf24" : "rgba(255,255,255,0.3)" }} />
      <span style={{ color: s === "completed" ? ACCENT : s === "pending" ? "#fbbf24" : "rgba(255,255,255,0.4)" }}>{status}</span>
    </span>
  );
}

export default function Remittance() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [converterAmount, setConverterAmount] = useState("");
  const [form, setForm] = useState({ senderName: user?.name ?? "", senderCountry: "UAE", recipientName: "", recipientUpiId: "", amountUsdg: "" });
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
  }

  useEffect(() => { load(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await apiFetch("/api/remittances", { method: "POST", headers: authHeaders, body: JSON.stringify(form) });
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
  const convInr = converterAmount ? (parseFloat(converterAmount) * INR_RATE).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;
  const formInr = form.amountUsdg ? (parseFloat(form.amountUsdg) * INR_RATE).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;
  const formFee = form.amountUsdg ? (parseFloat(form.amountUsdg) * 0.0075).toFixed(2) : null;
  const selectedFlag = FLAGS[form.senderCountry] ?? "🌍";

  return (
    <AppLayout>
      <div className="flex flex-col" style={{ height: "100vh" }}>
        {/* ── Compact header ── */}
        <div className="shrink-0 flex items-center gap-4 px-6 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
            <ArrowRightLeft className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-white">RemitDirect</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>0.75% fee</span>
            </div>
            <p className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.45)" }}>Cross-border → India in &lt;3 seconds</p>
          </div>
          {stats && (
            <div className="ml-auto flex items-center gap-5">
              {[
                { label: "transfers", value: stats.totalRemittances },
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

            {/* HERO: Live converter */}
            <div className="rounded-2xl p-5" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}22` }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] uppercase tracking-widest" style={{ color: ACCENT }}>Live Rate Calculator</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
                  <span className="text-[10px] font-mono" style={{ color: ACCENT }}>1 USDG = ₹{INR_RATE}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.35)" }}>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>You send (USDG)</p>
                  <input
                    type="number" min="0" step="0.01"
                    value={converterAmount}
                    onChange={(e) => setConverterAmount(e.target.value)}
                    placeholder="Enter amount…"
                    className="w-full bg-transparent text-2xl font-bold font-mono text-white outline-none"
                  />
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Fee: {converterAmount ? `$${(parseFloat(converterAmount) * 0.0075).toFixed(2)}` : "0.75% of amount"}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: `${ACCENT}25` }} />
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1 h-px" style={{ background: `${ACCENT}25` }} />
                </div>

                <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.35)" }}>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>🇮🇳 Recipient gets (INR)</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: convInr ? ACCENT : "rgba(255,255,255,0.2)" }}>
                    {convInr ? `₹${convInr}` : "₹0"}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Delivered to UPI instantly</p>
                </div>
              </div>

              <button onClick={() => { if (converterAmount) set("amountUsdg", converterAmount); }}
                className="w-full mt-4 text-[12px] font-semibold py-2 rounded-xl transition-all"
                style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                Use this amount →
              </button>
            </div>

            {/* Corridor cards */}
            <div className="grid grid-cols-3 gap-3">
              {CORRIDORS.map((c) => (
                <div key={c.code} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-xl mb-1">{c.flag}</p>
                  <p className="text-[11px] font-semibold text-white">{c.label}</p>
                  <p className="text-[10px] mt-1 font-mono" style={{ color: ACCENT }}>₹{INR_RATE}/USDG</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>⚡ &lt;3s</p>
                </div>
              ))}
            </div>

            {/* vs banks */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-2.5 grid grid-cols-3 text-[10px] uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)" }}>
                <span>Method</span><span className="text-center">Time</span><span className="text-right">Fee</span>
              </div>
              {[
                { m: "SWIFT / Wire", t: "3–5 days", f: "3–7%", win: false },
                { m: "Hawala / Cash", t: "1–2 days", f: "2–4%", win: false },
                { m: "RemitDirect", t: "< 3 seconds", f: "0.75%", win: true },
              ].map((row) => (
                <div key={row.m} className="px-4 py-3 grid grid-cols-3 items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: row.win ? `${ACCENT}06` : "transparent" }}>
                  <span className="text-sm font-medium" style={{ color: row.win ? "white" : "rgba(255,255,255,0.45)" }}>{row.win && "✓ "}{row.m}</span>
                  <span className="text-center font-mono text-sm" style={{ color: row.win ? ACCENT : "#f87171" }}>{row.t}</span>
                  <span className="text-right font-mono text-sm" style={{ color: row.win ? ACCENT : "#f87171" }}>{row.f}</span>
                </div>
              ))}
            </div>

            {/* Transfer history */}
            <div>
              <p className="text-[11px] uppercase tracking-widest mb-3 px-1" style={{ color: "rgba(255,255,255,0.3)" }}>Transfer History</p>
              {success && (
                <div className="rounded-2xl p-4 mb-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}22` }}>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-semibold">Settled in {success.settlementSeconds}s</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {FLAGS[success.senderCountry]} {success.senderName} → {success.recipientName} · ₹{parseFloat(success.amountInr).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {success.dodoCheckoutUrl && (
                        <a href={success.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                          Dodo ↗
                        </a>
                      )}
                      <button onClick={() => setSuccess(null)} className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>✕</button>
                    </div>
                  </div>
                </div>
              )}
              {remittances.length === 0 ? (
                <div className="rounded-2xl py-10 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ArrowRightLeft className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Use the calculator and send form → to get started</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  {remittances.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025]" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}>
                      <span className="text-xl shrink-0">{FLAGS[r.senderCountry] ?? "🌍"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white font-medium">{r.senderName} → {r.recipientName}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{r.senderCountry} → IN · {r.recipientUpiId}{r.settlementSeconds ? ` · ${r.settlementSeconds}s` : ""}</p>
                      </div>
                      <div className="text-right shrink-0 mr-2">
                        <p className="text-[13px] font-mono font-semibold text-white">${parseFloat(r.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>₹{parseFloat(r.amountInr).toLocaleString("en-IN")}</p>
                      </div>
                      <StatusDot status={r.status} />
                      {r.dodoCheckoutUrl && (
                        <a href={r.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {r.solanaSignature && (
                        <button onClick={() => navigator.clipboard.writeText(r.solanaSignature ?? "")} style={{ color: "rgba(255,255,255,0.18)" }}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — compact send form */}
          <div className="w-80 shrink-0 overflow-y-auto border-l p-5 space-y-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">Send Remittance</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{selectedFlag} → 🇮🇳 USDG → Solana → UPI</p>
            </div>

            <form onSubmit={handleSend} className="space-y-2.5">
              <input value={form.senderName} onChange={(e) => set("senderName", e.target.value)} required placeholder="Your full name"
                className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />

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

              <input value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} required placeholder="Recipient name (in India)"
                className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />

              <input value={form.recipientUpiId} onChange={(e) => set("recipientUpiId", e.target.value)} required placeholder="Recipient UPI ID (name@bank)"
                className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />

              <div>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="Amount in USDG"
                  className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none font-mono"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                {formInr && (
                  <div className="flex justify-between mt-1.5 px-1">
                    <span className="text-[11px]" style={{ color: ACCENT }}>≈ ₹{formInr}</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>fee ${formFee}</span>
                  </div>
                )}
              </div>

              {formError && (
                <div className="rounded-xl px-3 py-2 text-[12px]" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", color: "#f87171" }}>
                  {formError}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-2.5 rounded-xl transition-all disabled:opacity-60"
                style={{ background: ACCENT, color: "#000" }}>
                <Zap className="w-3.5 h-3.5" />
                {submitting ? "Settling on Solana…" : "Send Remittance"}
              </button>
            </form>

            {/* Info */}
            <div className="rounded-xl px-3 py-2.5 space-y-1.5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                `${selectedFlag} USDG locked on Solana`,
                "Dodo converts to fiat",
                "🇮🇳 INR to UPI in <3s",
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>{i + 1}</span>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s}</span>
                </div>
              ))}
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
    </AppLayout>
  );
}
