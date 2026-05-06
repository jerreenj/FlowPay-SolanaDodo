import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { ArrowRightLeft, Plus, CheckCircle, Copy, Globe } from "lucide-react";

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
    } catch { /* ignore */ }
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
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ArrowRightLeft className="w-5 h-5 text-white/60" />
              <h1 className="text-2xl font-bold text-white">RemitDirect</h1>
              <span className="text-xs bg-white/8 text-white/50 border border-white/12 px-2 py-0.5 rounded-full font-mono">0.75% fee</span>
            </div>
            <p className="text-white/50 text-sm">Cross-border remittances to India — Dubai→Mumbai in 2 seconds</p>
          </div>
          <button onClick={() => { setShowForm(true); setSuccess(null); }}
            className="flex items-center gap-2 bg-white hover:bg-white/90 text-black text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Send Money
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Remittances", value: stats.totalRemittances.toString() },
              { label: "Volume (USDG)", value: `$${parseFloat(stats.totalVolume).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
              { label: "Fees Earned", value: `$${parseFloat(stats.totalFees).toFixed(2)}` },
              { label: "Avg Settlement", value: `${stats.avgSettlementSeconds}s` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/50 uppercase tracking-wide">{label}</p>
                <p className="text-xl font-bold text-white font-mono mt-1">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Corridors */}
        {stats && stats.corridors.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
            <h3 className="text-xs text-white/50 uppercase tracking-wide mb-3">Active Corridors → India</h3>
            <div className="flex flex-wrap gap-2">
              {stats.corridors.map((c) => (
                <div key={c.country} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                  <span>{countryFlags[c.country] ?? <Globe className="w-3 h-3" />}</span>
                  <span className="text-xs text-white font-medium">{c.country}</span>
                  <span className="text-[10px] text-white/40">{c.count} tx</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-white/5 border border-white/15 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Remittance sent in {success.settlementSeconds}s!</span>
            </div>
            <div className="text-sm text-white/60">
              <p>{success.senderName} ({success.senderCountry}) sent <span className="text-white font-mono">${success.amountUsdg} USDG</span></p>
              <p>{success.recipientName} receives ₹{parseFloat(success.amountInr).toLocaleString()} to {success.recipientUpiId}</p>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-5">Send Remittance</h2>
            <form onSubmit={handleSend} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Sender Name</label>
                <input value={form.senderName} onChange={(e) => set("senderName", e.target.value)} required placeholder="Mohammed Al-Rashid"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Sending From</label>
                <select value={form.senderCountry} onChange={(e) => set("senderCountry", e.target.value)}
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all">
                  <option value="UAE">🇦🇪 UAE</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="UK">🇬🇧 United Kingdom</option>
                  <option value="SG">🇸🇬 Singapore</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="AU">🇦🇺 Australia</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Recipient Name</label>
                <input value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} required placeholder="Priya Sharma"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Recipient UPI ID</label>
                <input value={form.recipientUpiId} onChange={(e) => set("recipientUpiId", e.target.value)} required placeholder="priya@okaxis"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wide">Amount (USDG)</label>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="500.00"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
                {form.amountUsdg && (
                  <p className="text-xs text-white/40 mt-1">Recipient gets ≈ ₹{(parseFloat(form.amountUsdg || "0") * 83.5).toLocaleString()} · Fee: ${(parseFloat(form.amountUsdg || "0") * 0.0075).toFixed(4)} USDG</p>
                )}
              </div>
              <div className="col-span-2 flex gap-3 mt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-white hover:bg-white/90 text-black text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? "Processing on Solana…" : "Send Remittance"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Recent Remittances</h2>
          </div>
          {loading ? (
            <div>{[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-white/3" />)}</div>
          ) : remittances.length === 0 ? (
            <div className="px-6 py-10 text-center text-white/40 text-sm">No remittances yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {remittances.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                  <div className="text-xl shrink-0">{countryFlags[r.senderCountry] ?? "🌍"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{r.senderName} → {r.recipientName}</p>
                    <p className="text-xs text-white/40 mt-0.5">{r.senderCountry} → IN · {r.recipientUpiId} · {new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-white">${parseFloat(r.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-white/40">₹{parseFloat(r.amountInr).toLocaleString()} · {r.settlementSeconds}s</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0 bg-white/10 text-white/50">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
