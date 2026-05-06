import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { ShieldCheck, Plus, CheckCircle, AlertTriangle, Copy, Unlock, X } from "lucide-react";

const ACCENT = "#a78bfa";

interface Escrow {
  id: number;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  freelancerEmail: string;
  projectTitle: string;
  description: string;
  amountUsdg: string;
  feeUsdg: string;
  milestones: number;
  completedMilestones: number;
  status: string;
  solanaAddress: string | null;
  solanaSignature: string | null;
  dodoPaymentId: string | null;
  dodoCheckoutUrl: string | null;
  createdAt: string;
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const style =
    s === "released" || s === "completed"
      ? { color: "#4ade80", background: "#4ade8015", border: "1px solid #4ade8030" }
      : s === "active"
      ? { color: ACCENT, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }
      : s === "disputed"
      ? { color: "#f87171", background: "#f8717115", border: "1px solid #f8717130" }
      : { color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" };
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={style}>
      {status}
    </span>
  );
}

export default function EscrowPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ clientName: user?.name ?? "", clientEmail: "", freelancerName: "", freelancerEmail: "", projectTitle: "", description: "", amountUsdg: "", milestones: "2" });
  const [success, setSuccess] = useState<Escrow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const data = await apiFetch("/api/escrows", { headers: authHeaders }).then((r) => r.json());
      setEscrows(data);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await apiFetch("/api/escrows", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ ...form, milestones: parseInt(form.milestones) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create escrow");
      setSuccess(data);
      setShowForm(false);
      setForm({ clientName: user?.name ?? "", clientEmail: "", freelancerName: "", freelancerEmail: "", projectTitle: "", description: "", amountUsdg: "", milestones: "2" });
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    }
    finally { setSubmitting(false); }
  }

  async function release(id: number) {
    await apiFetch(`/api/escrows/${id}/release`, { method: "PATCH", headers: authHeaders });
    await load();
  }

  async function dispute(id: number) {
    await apiFetch(`/api/escrows/${id}/dispute`, { method: "PATCH", headers: authHeaders });
    await load();
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 65% 140% at 0% 0%, ${ACCENT}10 0%, transparent 70%)` }} />
        <div className="relative z-10 flex items-start justify-between px-8 pt-8 pb-7 min-w-0 gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 20px ${ACCENT}18` }}>
              <ShieldCheck className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div className="min-w-0 max-w-[54rem]">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-[clamp(1.35rem,2.5vw,2rem)] font-bold text-white tracking-tight">EscrowX</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>0.5% fee</span>
              </div>
              <p className="text-[13px] sm:text-sm leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.56)" }}>Smart contract escrow on Solana — trustless milestone payments for freelancers</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setSuccess(null); setFormError(null); }}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all shrink-0"
            style={{ background: ACCENT, color: "#000" }}
          >
            <Plus className="w-4 h-4" /> Create Escrow
          </button>
        </div>
      </div>

      <div className="p-8">
        {success && (
          <div className="rounded-2xl p-5 mb-6 flex items-start gap-4" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}25` }}>
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: ACCENT }} />
            <div className="flex-1">
              <p className="text-white font-semibold mb-1">Escrow deployed on Solana</p>
              <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                <span className="text-white">{success.projectTitle}</span> — ${success.amountUsdg} USDG locked across {success.milestones} milestones
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>Contract: {success.solanaAddress?.slice(0, 20)}…</span>
                <button onClick={() => navigator.clipboard.writeText(success.solanaAddress ?? "")} className="hover:text-white/60 transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              {success.dodoPaymentId && (
                <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Dodo: {success.dodoPaymentId.startsWith("cks_") ? success.dodoPaymentId.slice(0, 16) + "…" : "pending"}
                </p>
              )}
              {success.dodoCheckoutUrl && (
                <a href={success.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium mt-1 underline underline-offset-2"
                  style={{ color: ACCENT }}>
                  Fund escrow via Dodo ↗
                </a>
              )}
            </div>
            <button onClick={() => setSuccess(null)} className="text-white/20 hover:text-white/50 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        )}

        {showForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Create Escrow Contract</h2>
              <button onClick={() => setShowForm(false)} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              {[
                { key: "clientName", label: "Client Name", placeholder: "TechCorp USA" },
                { key: "clientEmail", label: "Client Email", placeholder: "john@techcorp.com", type: "email" },
                { key: "freelancerName", label: "Freelancer Name", placeholder: "Priya Menon" },
                { key: "freelancerEmail", label: "Freelancer Email", placeholder: "priya@gmail.com", type: "email" },
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
              <div className="col-span-2">
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Project Title</label>
                <input value={form.projectTitle} onChange={(e) => set("projectTitle", e.target.value)} required placeholder="React Dashboard Build"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={2} placeholder="Describe the work scope…"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Amount (USDG)</label>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="2000.00"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                {form.amountUsdg && (
                  <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Fee: ${(parseFloat(form.amountUsdg || "0") * 0.005).toFixed(4)} USDG</p>
                )}
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Milestones</label>
                <select value={form.milestones} onChange={(e) => set("milestones", e.target.value)}
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} milestone{n > 1 ? "s" : ""}</option>)}
                </select>
              </div>
              {formError && (
                <div className="col-span-2 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                  {formError}
                </div>
              )}
              <div className="col-span-2 flex gap-3 pt-1">
                <button type="submit" disabled={submitting}
                  className="flex-1 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ background: ACCENT, color: "#000" }}>
                  {submitting ? "Locking on Solana…" : "Create Escrow"}
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

        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }} />)
          ) : escrows.length === 0 ? (
            <div className="rounded-2xl px-6 py-12 text-center text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}>
              No escrows yet — create your first contract
            </div>
          ) : (
            escrows.map((e) => (
              <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2 gap-4">
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-[15px]">{e.projectTitle}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{e.clientName} → {e.freelancerName}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusPill status={e.status} />
                      <p className="text-xl font-bold text-white font-mono">${parseFloat(e.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.48)" }}>{e.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Milestones: {e.completedMilestones}/{e.milestones}</span>
                      <span className="text-xs font-mono" style={{ color: ACCENT }}>{Math.round((e.completedMilestones / e.milestones) * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(e.completedMilestones / e.milestones) * 100}%`, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}60` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {e.solanaAddress && (
                        <>
                          <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Contract: {e.solanaAddress.slice(0, 12)}…</span>
                          <button onClick={() => navigator.clipboard.writeText(e.solanaAddress ?? "")} className="transition-colors hover:text-white/60" style={{ color: "rgba(255,255,255,0.2)" }}>
                            <Copy className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      {e.dodoCheckoutUrl && (
                        <a href={e.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-medium underline underline-offset-2"
                          style={{ color: ACCENT }}>
                          Fund via Dodo ↗
                        </a>
                      )}
                    </div>
                    {e.status === "active" && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => release(e.id)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                          <Unlock className="w-3 h-3" /> Release
                        </button>
                        <button onClick={() => dispute(e.id)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
                          <AlertTriangle className="w-3 h-3" /> Dispute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
