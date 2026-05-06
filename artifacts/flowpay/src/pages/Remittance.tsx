import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { ArrowRightLeft, Plus, CheckCircle, Copy, Globe, X } from "lucide-react";

const ACCENT = "#38bdf8";

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
  createdAt: string;
}

interface Stats {
  totalRemittances: number;
  totalVolume: string;
  totalFees: string;
  avgSettlementSeconds: number;
  corridors: { country: string; count: number; volume: string }[];
}

const countryFlags: Record<string, string> = {
  US: "🇺🇸", UAE: "🇦🇪", UK: "🇬🇧", SG: "🇸🇬", CA: "🇨🇦", AU: "🇦🇺", IN: "🇮🇳",
};

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
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ senderName: "", senderCountry: "UAE", recipientName: "", recipientUpiId: "", amountUsdg: "" });
  const [success, setSuccess] = useState<Remittance | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const [r, s] = await Promise.all([
        apiFetch("/api/remittances", { headers: authHeaders }).then((r) => r.json()),
        apiFetch("/api/remittances/stats", { headers: authHeaders }).then((r) => r.json()),
      ]);
      setRemittances(r);
      setStats(s);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/remittances", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data);
      setShowForm(false);
      setForm({ senderName: "", senderCountry: "UAE", recipientName: "", recipientUpiId: "", amountUsdg: "" });
      await load();
    } catch { }
    finally { setSubmitting(false); }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 55% 120% at 0% 0%, ${ACCENT}0a 0%, transparent 65%)` }} />
        <div className="relative z-10 flex items-start justify-between px-8 pt-8 pb-7">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 20px ${ACCENT}18` }}>
              <ArrowRightLeft className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-white tracking-tight">RemitDirect</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>0.75% fee</span>
              </div>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.42)" }}>Cross-border remittances to India — Dubai→Mumbai in 2 seconds</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setSuccess(null); }}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all shrink-0"
            style={{ background: ACCENT, color: "#000" }}
          >
            <Plus className="w-4 h-4" /> Send Money
          </button>
        </div>
      </div>

      <div className="p-8">
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Remittances", value: stats.totalRemittances.toString(), colored: true },
              { label: "Volume (USDG)", value: `$${parseFloat(stats.totalVolume).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, colored: false },
              { label: "Fees Earned", value: `$${parseFloat(stats.totalFees).toFixed(2)}`, colored: false },
              { label: "Avg Settlement", value: `${stats.avgSettlementSeconds}s`, colored: false },
            ].map(({ label, value, colored }) => (
              <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                <p className="text-2xl font-bold font-mono tracking-tight" style={{ color: colored ? ACCENT : "white" }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {stats?.corridors && stats.corridors.length > 0 && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Active Corridors → India</p>
            <div className="flex flex-wrap gap-2">
              {stats.corridors.map((c) => (
                <div key={c.country} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}18` }}>
                  <span>{countryFlags[c.country] ?? <Globe className="w-3 h-3" />}</span>
                  <span className="text-xs text-white font-medium">{c.country}</span>
                  <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{c.count} tx</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-2xl p-5 mb-6 flex items-start gap-4" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}25` }}>
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: ACCENT }} />
            <div className="flex-1">
              <p className="text-white font-semibold mb-1">Remittance sent in {success.settlementSeconds}s</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                {success.senderName} ({success.senderCountry}) → {success.recipientName} · ₹{parseFloat(success.amountInr).toLocaleString()} to {success.recipientUpiId}
              </p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-white/20 hover:text-white/50 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        )}

        {showForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Send Remittance</h2>
              <button onClick={() => setShowForm(false)} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSend} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Sender Name</label>
                <input value={form.senderName} onChange={(e) => set("senderName", e.target.value)} required placeholder="Mohammed Al-Rashid"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Sending From</label>
                <select value={form.senderCountry} onChange={(e) => set("senderCountry", e.target.value)}
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
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
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Recipient Name</label>
                <input value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} required placeholder="Priya Sharma"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Recipient UPI ID</label>
                <input value={form.recipientUpiId} onChange={(e) => set("recipientUpiId", e.target.value)} required placeholder="priya@okaxis"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Amount (USDG)</label>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="500.00"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                {form.amountUsdg && (
                  <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Recipient gets ≈ ₹{(parseFloat(form.amountUsdg || "0") * 83.5).toLocaleString()} · Fee: ${(parseFloat(form.amountUsdg || "0") * 0.0075).toFixed(4)} USDG
                  </p>
                )}
              </div>
              <div className="col-span-2 flex gap-3 pt-1">
                <button type="submit" disabled={submitting}
                  className="flex-1 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ background: ACCENT, color: "#000" }}>
                  {submitting ? "Processing on Solana…" : "Send Remittance"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 text-sm rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <h2 className="text-[13px] font-semibold text-white">Recent Remittances</h2>
            {remittances.length > 0 && <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{remittances.length} total</span>}
          </div>
          {loading ? (
            <div>{[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />)}</div>
          ) : remittances.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No remittances yet</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {remittances.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                  <div className="text-2xl shrink-0">{countryFlags[r.senderCountry] ?? "🌍"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{r.senderName} → {r.recipientName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{r.senderCountry} → IN · {r.recipientUpiId} · {new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-white">${parseFloat(r.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>₹{parseFloat(r.amountInr).toLocaleString()} · {r.settlementSeconds}s</p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
