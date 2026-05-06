import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Users, Plus, CheckCircle, Clock, ChevronRight, Copy } from "lucide-react";

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
  return sig.slice(0, 8) + "…" + sig.slice(-8);
}

export default function Payroll() {
  const token = useAuthStore((s) => s.token);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ senderName: user?.name ?? "", senderCompany: "", recipientName: "", recipientEmail: "", amountUsdg: "", recipientUpiId: "" });
  const [success, setSuccess] = useState<Payment | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const [p, s] = await Promise.all([
        apiFetch("/api/payroll/payments", { headers: authHeaders }).then((r) => r.json()),
        apiFetch("/api/payroll/stats", { headers: authHeaders }).then((r) => r.json()),
      ]);
      setPayments(p);
      setStats(s);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/payroll/payments", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data);
      setShowForm(false);
      setForm({ senderName: user?.name ?? "", senderCompany: "", recipientName: "", recipientEmail: "", amountUsdg: "", recipientUpiId: "" });
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
              <Users className="w-5 h-5 text-white/60" />
              <h1 className="text-2xl font-bold text-white">PayRails</h1>
              <span className="text-xs bg-white/8 text-white/50 border border-white/12 px-2 py-0.5 rounded-full font-mono">0.5% fee</span>
            </div>
            <p className="text-white/50 text-sm">Stablecoin payroll for remote teams — settled on Solana in &lt;3s</p>
          </div>
          <button onClick={() => { setShowForm(true); setSuccess(null); }}
            className="flex items-center gap-2 bg-white hover:bg-white/90 text-black text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Payment
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Payments", value: stats.totalPayments.toString() },
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

        {/* Success notification */}
        {success && (
          <div className="bg-white/5 border border-white/15 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Payment sent in {success.settlementSeconds}s!</span>
            </div>
            <div className="text-sm text-white/60 space-y-1">
              <p>{success.recipientName} received <span className="text-white font-mono">${success.amountUsdg} USDG</span> (₹{parseFloat(success.amountInr).toLocaleString()})</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xs text-white/40">Solana Sig:</span>
                <span className="font-mono text-xs text-white/50">{truncateSig(success.solanaSignature)}</span>
                <button onClick={() => navigator.clipboard.writeText(success.solanaSignature ?? "")} className="text-white/30 hover:text-white/70">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-5">Send Payroll Payment</h2>
            <form onSubmit={handleSend} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Sender Name</label>
                <input value={form.senderName} onChange={(e) => set("senderName", e.target.value)} required
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Company</label>
                <input value={form.senderCompany} onChange={(e) => set("senderCompany", e.target.value)} required placeholder="Acme Corp"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Recipient Name</label>
                <input value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} required placeholder="Priya Patel"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Recipient Email</label>
                <input type="email" value={form.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)} required placeholder="priya@gmail.com"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Amount (USDG)</label>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="500.00"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
                {form.amountUsdg && (
                  <p className="text-xs text-white/40 mt-1">≈ ₹{(parseFloat(form.amountUsdg || "0") * 83.5).toLocaleString()} · Fee: ${(parseFloat(form.amountUsdg || "0") * 0.005).toFixed(4)} USDG</p>
                )}
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">UPI ID (optional)</label>
                <input value={form.recipientUpiId} onChange={(e) => set("recipientUpiId", e.target.value)} placeholder="priya@okaxis"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div className="col-span-2 flex gap-3 mt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-white hover:bg-white/90 text-black text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? "Sending on Solana…" : "Send Payment"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payments list */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Recent Payments</h2>
          </div>
          {loading ? (
            <div className="divide-y divide-white/5">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-white/3" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="px-6 py-10 text-center text-white/40 text-sm">No payments yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{p.senderCompany} → {p.recipientName}</p>
                    <p className="text-xs text-white/40 mt-0.5">{p.recipientEmail} · {new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-white">${parseFloat(p.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-white/40">₹{parseFloat(p.amountInr).toLocaleString()} · {p.settlementSeconds}s</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      {p.status}
                    </span>
                    {p.solanaSignature && (
                      <button onClick={() => navigator.clipboard.writeText(p.solanaSignature ?? "")} className="text-white/20 hover:text-white/60 transition-colors">
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
    </AppLayout>
  );
}
