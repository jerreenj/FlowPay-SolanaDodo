import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { ShieldCheck, Plus, CheckCircle, AlertTriangle, Copy, Unlock, X, ArrowRight } from "lucide-react";

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
  milestones: number;
  completedMilestones: number;
  status: string;
  solanaAddress: string | null;
  dodoCheckoutUrl: string | null;
  createdAt: string;
}

function MilestoneDots({ total, completed }: { total: number; completed: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < completed;
        const current = i === completed;
        return (
          <div key={i} className="flex items-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={done
                ? { background: ACCENT, color: "#000", boxShadow: `0 0 8px ${ACCENT}55` }
                : current
                ? { background: `${ACCENT}22`, border: `2px solid ${ACCENT}`, color: ACCENT }
                : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.3)" }
              }>
              {done ? "✓" : i + 1}
            </div>
            {i < total - 1 && <div className="w-5 h-px" style={{ background: done ? `${ACCENT}60` : "rgba(255,255,255,0.1)" }} />}
          </div>
        );
      })}
    </div>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  const ini = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
      {ini}
    </div>
  );
}

const inp = "w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none";
const inpSt = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" };
const onFo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = `${ACCENT}55`);
const onBl = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "rgba(255,255,255,0.09)");

const FLOW_STEPS = [
  { icon: "🔒", label: "Lock Funds", sub: "USDG held on-chain", color: "#38bdf8" },
  { icon: "🎯", label: "Milestones", sub: "Client approves each", color: ACCENT },
  { icon: "💸", label: "Auto Release", sub: "USDG to freelancer", color: "#4ade80" },
];

export default function EscrowPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ clientName: user?.name ?? "", clientEmail: "", freelancerName: "", freelancerEmail: "", projectTitle: "", description: "", amountUsdg: "", milestones: "2" });
  const [success, setSuccess] = useState<Escrow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [msOpen, setMsOpen] = useState(false);
  const msRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) { if (msRef.current && !msRef.current.contains(e.target as Node)) setMsOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const data = await apiFetch("/api/escrows", { headers: authHeaders }).then((r) => r.json());
      setEscrows(data);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await apiFetch("/api/escrows", { method: "POST", headers: authHeaders, body: JSON.stringify({ ...form, milestones: parseInt(form.milestones) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSuccess(data);
      setForm({ clientName: user?.name ?? "", clientEmail: "", freelancerName: "", freelancerEmail: "", projectTitle: "", description: "", amountUsdg: "", milestones: "2" });
      await load();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Error"); }
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
  const perMs = form.amountUsdg && form.milestones ? (parseFloat(form.amountUsdg) / parseInt(form.milestones)).toFixed(2) : null;
  const activeEscrows = escrows.filter((e) => e.status === "active");
  const totalLocked = escrows.reduce((s, e) => s + parseFloat(e.amountUsdg || "0"), 0);

  return (
    <AppLayout>
      <div className="flex flex-col" style={{ height: "100vh" }}>
        {/* ── Compact header ── */}
        <div className="shrink-0 flex items-center gap-4 pl-14 pr-6 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
            <ShieldCheck className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-white">EscrowX</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>0.5% fee</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.09)" }}>Smart Contract</span>
            </div>
            <p className="text-[11px] leading-tight font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Trustless milestone escrow on Solana</p>
          </div>
          <div className="ml-auto flex items-center gap-5">
            {[
              { label: "contracts", value: escrows.length },
              { label: "active", value: activeEscrows.length },
              { label: "locked", value: `$${totalLocked.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[18px] font-bold font-mono text-white leading-none">{value}</p>
                <p className="text-[13px] mt-1 font-semibold capitalize" style={{ color: "rgba(255,255,255,0.62)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2-col ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* How it works */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Smart Contract Flow</p>
              <div className="flex items-center gap-2">
                {FLOW_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className="flex-1 text-center">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mx-auto mb-2" style={{ background: `${step.color}12`, border: `1px solid ${step.color}25` }}>
                        {step.icon}
                      </div>
                      <p className="text-[12px] font-semibold text-white">{step.label}</p>
                      <p className="text-[12px] mt-1 font-semibold" style={{ color: "rgba(255,255,255,0.72)" }}>{step.sub}</p>
                    </div>
                    {i < FLOW_STEPS.length - 1 && <ArrowRight className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />}
                  </div>
                ))}
              </div>
              <p className="text-[12px] mt-4 pt-4 text-center font-medium" style={{ color: "rgba(255,255,255,0.62)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                Funds are locked on Solana until milestones are approved — neither party can withdraw unilaterally
              </p>
            </div>

            {/* Success banner */}
            {success && (
              <div className="rounded-2xl p-4" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}22` }}>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  <div className="flex-1">
                    <p className="text-sm text-white font-semibold">Escrow deployed on Solana</p>
                    <p className="text-[12px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>
                      {success.projectTitle} · ${success.amountUsdg} USDG across {success.milestones} milestones
                    </p>
                    {success.solanaAddress && <p className="text-[11px] font-mono mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{success.solanaAddress.slice(0, 20)}…</p>}
                    {success.dodoCheckoutUrl && (
                      <a href={success.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] underline underline-offset-2 mt-1 inline-block" style={{ color: ACCENT }}>
                        Fund via Dodo ↗
                      </a>
                    )}
                  </div>
                  <button onClick={() => setSuccess(null)} className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>✕</button>
                </div>
              </div>
            )}

            {/* Escrow cards */}
            <div>
              <p className="text-[13px] uppercase tracking-widest mb-3 px-1 font-semibold" style={{ color: "rgba(255,255,255,0.60)" }}>Contracts</p>
              {loading ? (
                [...Array(2)].map((_, i) => <div key={i} className="h-36 rounded-2xl mb-3 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />)
              ) : escrows.length === 0 ? (
                <div className="rounded-2xl py-10 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.52)" }}>No contracts yet — create your first escrow using the form →</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {escrows.map((e) => {
                    const pct = Math.round((e.completedMilestones / e.milestones) * 100);
                    const msVal = (parseFloat(e.amountUsdg) / e.milestones).toFixed(2);
                    const statusColor = e.status === "active" ? ACCENT : e.status === "released" || e.status === "completed" ? "#4ade80" : e.status === "disputed" ? "#f87171" : "rgba(255,255,255,0.4)";
                    return (
                      <div key={e.id} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={e.clientName} color="#38bdf8" />
                            <ArrowRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.2)" }} />
                            <Avatar name={e.freelancerName} color={ACCENT} />
                            <div className="ml-1">
                              <p className="text-[14px] text-white font-bold">{e.projectTitle}</p>
                              <p className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{e.clientName} → {e.freelancerName}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[15px] font-bold font-mono text-white">${parseFloat(e.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}25` }}>{e.status}</span>
                          </div>
                        </div>

                        <p className="text-[14px] mb-3 font-medium" style={{ color: "rgba(255,255,255,0.68)" }}>{e.description}</p>

                        <div className="mb-3">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{e.completedMilestones}/{e.milestones} milestones · ${msVal} each</span>
                            <span className="text-[13px] font-mono font-bold" style={{ color: ACCENT }}>{pct}%</span>
                          </div>
                          <MilestoneDots total={e.milestones} completed={e.completedMilestones} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {e.solanaAddress && (
                              <>
                                <span className="text-[12px] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>{e.solanaAddress.slice(0, 10)}…</span>
                                <button onClick={() => navigator.clipboard.writeText(e.solanaAddress ?? "")} style={{ color: "rgba(255,255,255,0.2)" }}><Copy className="w-3 h-3" /></button>
                              </>
                            )}
                            {e.dodoCheckoutUrl && (
                              <a href={e.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold underline underline-offset-2" style={{ color: ACCENT }}>Fund via Dodo ↗</a>
                            )}
                          </div>
                          {e.status === "active" && (
                            <div className="flex gap-2">
                              <button onClick={() => release(e.id)} className="flex items-center gap-1 text-[13px] font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                                <Unlock className="w-3 h-3" /> Release
                              </button>
                              <button onClick={() => dispute(e.id)} className="flex items-center gap-1 text-[13px] font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.22)" }}>
                                <AlertTriangle className="w-3 h-3" /> Dispute
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — create form */}
          <div className="w-80 shrink-0 overflow-y-auto border-l p-5 space-y-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">Create Contract</p>
              <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Funds locked on Solana until delivery</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} required placeholder="Client name"
                  className={inp} style={inpSt} onFocus={onFo} onBlur={onBl} />
                <input type="email" value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} required placeholder="Client email"
                  className={inp} style={inpSt} onFocus={onFo} onBlur={onBl} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={form.freelancerName} onChange={(e) => set("freelancerName", e.target.value)} required placeholder="Freelancer name"
                  className={inp} style={inpSt} onFocus={onFo} onBlur={onBl} />
                <input type="email" value={form.freelancerEmail} onChange={(e) => set("freelancerEmail", e.target.value)} required placeholder="Freelancer email"
                  className={inp} style={inpSt} onFocus={onFo} onBlur={onBl} />
              </div>
              <input value={form.projectTitle} onChange={(e) => set("projectTitle", e.target.value)} required placeholder="Project title"
                className={inp} style={inpSt} onFocus={onFo} onBlur={onBl} />
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={2}
                placeholder="Scope of work &amp; deliverables…"
                className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none resize-none"
                style={inpSt} onFocus={onFo} onBlur={onBl} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="Amount (USDG)"
                    className={`${inp} font-mono`} style={inpSt} onFocus={onFo} onBlur={onBl} />
                </div>
                <div ref={msRef} className="relative">
                  <button type="button" onClick={() => setMsOpen((o) => !o)}
                    className={`${inp} flex items-center justify-between w-full`}
                    style={{ ...inpSt, borderColor: msOpen ? `${ACCENT}55` : "rgba(255,255,255,0.09)" }}>
                    <span>{form.milestones} milestone{parseInt(form.milestones) > 1 ? "s" : ""}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5, transform: msOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                      <path d="M2 4l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {msOpen && (
                    <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
                      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button"
                          onClick={() => { set("milestones", String(n)); setMsOpen(false); }}
                          className="w-full px-3 py-2 text-left text-[13px] transition-colors"
                          style={{
                            color: form.milestones === String(n) ? ACCENT : "rgba(255,255,255,0.85)",
                            background: form.milestones === String(n) ? `${ACCENT}18` : "transparent",
                          }}
                          onMouseEnter={(e) => { if (form.milestones !== String(n)) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = form.milestones === String(n) ? `${ACCENT}18` : "transparent"; }}>
                          {n} milestone{n > 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {perMs && (
                <p className="text-[11px] px-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  ${perMs} USDG per milestone · Fee: ${(parseFloat(form.amountUsdg) * 0.005).toFixed(2)}
                </p>
              )}
              {formError && (
                <div className="rounded-xl px-3 py-2 text-[12px]" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", color: "#f87171" }}>{formError}</div>
              )}
              <button type="submit" disabled={submitting}
                className="w-full text-[13px] font-bold py-2.5 rounded-xl transition-all disabled:opacity-60"
                style={{ background: ACCENT, color: "#000" }}>
                {submitting ? "Deploying on Solana…" : "🔒 Create & Lock Escrow"}
              </button>
            </form>

            {/* Guarantees */}
            <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Contract Guarantees</p>
              {[
                "Funds held on-chain, not by us",
                "Dispute resolution via Solana validators",
                "Immutable milestone record on ledger",
              ].map((g, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: ACCENT }} className="text-[11px] mt-0.5">✓</span>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
