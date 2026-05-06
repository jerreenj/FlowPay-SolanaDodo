import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Users, Plus, CheckCircle, Copy, X } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    } catch { }
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
              <Users className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-white tracking-tight">PayRails</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>0.5% fee</span>
              </div>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.42)" }}>Stablecoin payroll for remote teams — settled on Solana in &lt;3s</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setSuccess(null); }}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all shrink-0"
            style={{ background: ACCENT, color: "#000" }}
          >
            <Plus className="w-4 h-4" /> New Payment
          </button>
        </div>
      </div>

      <div className="p-8">
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Payments", value: stats.totalPayments.toString(), colored: true },
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

        {success && (
          <div className="rounded-2xl p-5 mb-6 flex items-start gap-4" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}25` }}>
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: ACCENT }} />
            <div className="flex-1">
              <p className="text-white font-semibold mb-1">Payment settled in {success.settlementSeconds}s</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                {success.recipientName} received <span className="text-white font-mono">${success.amountUsdg} USDG</span> · ₹{parseFloat(success.amountInr).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>Sig: {truncateSig(success.solanaSignature)}</span>
                <button onClick={() => navigator.clipboard.writeText(success.solanaSignature ?? "")} style={{ color: "rgba(255,255,255,0.3)" }} className="hover:text-white/60 transition-colors">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <button onClick={() => setSuccess(null)} className="text-white/20 hover:text-white/50 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        )}

        {showForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Send Payroll Payment</h2>
              <button onClick={() => setShowForm(false)} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSend} className="grid grid-cols-2 gap-4">
              {[
                { key: "senderName", label: "Sender Name", placeholder: "Your Name" },
                { key: "senderCompany", label: "Company", placeholder: "Acme Corp" },
                { key: "recipientName", label: "Recipient Name", placeholder: "Priya Patel" },
                { key: "recipientEmail", label: "Recipient Email", placeholder: "priya@gmail.com", type: "email" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
                  <input type={type ?? "text"} value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} required placeholder={placeholder}
                    className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                </div>
              ))}
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Amount (USDG)</label>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="500.00"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                {form.amountUsdg && (
                  <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    ≈ ₹{(parseFloat(form.amountUsdg || "0") * 83.5).toLocaleString()} · Fee: ${(parseFloat(form.amountUsdg || "0") * 0.005).toFixed(4)} USDG
                  </p>
                )}
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>UPI ID (optional)</label>
                <input value={form.recipientUpiId} onChange={(e) => set("recipientUpiId", e.target.value)} placeholder="priya@okaxis"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div className="col-span-2 flex gap-3 pt-1">
                <button type="submit" disabled={submitting}
                  className="flex-1 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ background: ACCENT, color: "#000" }}>
                  {submitting ? "Sending on Solana…" : "Send Payment"}
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
            <h2 className="text-[13px] font-semibold text-white">Recent Payments</h2>
            {payments.length > 0 && <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{payments.length} total</span>}
          </div>
          {loading ? (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No payments yet — send your first one</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {payments.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}20` }}>
                    <Users className="w-4 h-4" style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{p.senderCompany} → {p.recipientName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{p.recipientEmail} · {new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-white">${parseFloat(p.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>₹{parseFloat(p.amountInr).toLocaleString()} · {p.settlementSeconds}s</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={p.status} />
                    {p.solanaSignature && (
                      <button onClick={() => navigator.clipboard.writeText(p.solanaSignature ?? "")} className="transition-colors hover:text-white/60" style={{ color: "rgba(255,255,255,0.18)" }}>
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
