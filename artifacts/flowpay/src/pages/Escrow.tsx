import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { ShieldCheck, Plus, CheckCircle, AlertTriangle, Copy, Unlock } from "lucide-react";

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
  createdAt: string;
}

export default function EscrowPage() {
  const token = useAuthStore((s) => s.token);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ clientName: "", clientEmail: "", freelancerName: "", freelancerEmail: "", projectTitle: "", description: "", amountUsdg: "", milestones: "2" });
  const [success, setSuccess] = useState<Escrow | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const data = await fetch("/api/escrows", { headers: authHeaders }).then((r) => r.json());
      setEscrows(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/escrows", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ ...form, milestones: parseInt(form.milestones) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data);
      setShowForm(false);
      setForm({ clientName: "", clientEmail: "", freelancerName: "", freelancerEmail: "", projectTitle: "", description: "", amountUsdg: "", milestones: "2" });
      await load();
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  async function release(id: number) {
    await fetch(`/api/escrows/${id}/release`, { method: "PATCH", headers: authHeaders });
    await load();
  }

  async function dispute(id: number) {
    await fetch(`/api/escrows/${id}/dispute`, { method: "PATCH", headers: authHeaders });
    await load();
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const statusColor: Record<string, string> = {
    active: "bg-blue-400/10 text-blue-400",
    released: "bg-[#00ff88]/10 text-[#00ff88]",
    disputed: "bg-red-400/10 text-red-400",
    completed: "bg-[#00ff88]/10 text-[#00ff88]",
  };

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              <h1 className="text-2xl font-bold text-white">EscrowX</h1>
              <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded-full font-mono">0.5% fee</span>
            </div>
            <p className="text-white/50 text-sm">Smart contract escrow on Solana — trustless milestone payments for freelancers</p>
          </div>
          <button onClick={() => { setShowForm(true); setSuccess(null); }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Create Escrow
          </button>
        </div>

        {success && (
          <div className="bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-[#00ff88]" />
              <span className="text-[#00ff88] font-semibold">Escrow created on Solana!</span>
            </div>
            <div className="text-sm text-white/60 space-y-1">
              <p><span className="text-white">{success.projectTitle}</span> — ${success.amountUsdg} USDG locked</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/40 font-mono">Contract:</span>
                <span className="text-xs text-[#00ff88]/80 font-mono">{success.solanaAddress?.slice(0, 20)}…</span>
                <button onClick={() => navigator.clipboard.writeText(success.solanaAddress ?? "")} className="text-white/30 hover:text-white/60"><Copy className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-5">Create Escrow Contract</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Client Name</label>
                <input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} required placeholder="TechCorp USA"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Client Email</label>
                <input type="email" value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} required placeholder="john@techcorp.com"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Freelancer Name</label>
                <input value={form.freelancerName} onChange={(e) => set("freelancerName", e.target.value)} required placeholder="Priya Menon"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Freelancer Email</label>
                <input type="email" value={form.freelancerEmail} onChange={(e) => set("freelancerEmail", e.target.value)} required placeholder="priya@gmail.com"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wide">Project Title</label>
                <input value={form.projectTitle} onChange={(e) => set("projectTitle", e.target.value)} required placeholder="React Dashboard Build"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={2} placeholder="Describe the work scope…"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all resize-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Amount (USDG)</label>
                <input type="number" min="0.01" step="0.01" value={form.amountUsdg} onChange={(e) => set("amountUsdg", e.target.value)} required placeholder="2000.00"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all" />
                {form.amountUsdg && (
                  <p className="text-xs text-white/40 mt-1">Fee: ${(parseFloat(form.amountUsdg || "0") * 0.005).toFixed(4)} USDG</p>
                )}
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Milestones</label>
                <select value={form.milestones} onChange={(e) => set("milestones", e.target.value)}
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-all">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} milestone{n > 1 ? "s" : ""}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex gap-3 mt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? "Locking on Solana…" : "Create Escrow"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-xl animate-pulse" />)
          ) : escrows.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-10 text-center text-white/40 text-sm">No escrows yet</div>
          ) : (
            escrows.map((e) => (
              <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{e.projectTitle}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{e.clientName} → {e.freelancerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[e.status] ?? "bg-white/10 text-white/50"}`}>{e.status}</span>
                    <p className="text-lg font-bold text-[#00ff88] font-mono">${parseFloat(e.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <p className="text-sm text-white/50 mb-4">{e.description}</p>

                {/* Milestones */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                    <span>Milestones: {e.completedMilestones}/{e.milestones}</span>
                    <span>{Math.round((e.completedMilestones / e.milestones) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00ff88] rounded-full transition-all" style={{ width: `${(e.completedMilestones / e.milestones) * 100}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    {e.solanaAddress && (
                      <>
                        <span className="font-mono">Contract: {e.solanaAddress.slice(0, 12)}…</span>
                        <button onClick={() => navigator.clipboard.writeText(e.solanaAddress ?? "")} className="hover:text-white/70"><Copy className="w-3 h-3" /></button>
                      </>
                    )}
                  </div>
                  {e.status === "active" && (
                    <div className="flex gap-2">
                      <button onClick={() => release(e.id)}
                        className="flex items-center gap-1.5 text-xs bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/20 px-3 py-1.5 rounded-lg transition-colors">
                        <Unlock className="w-3 h-3" /> Release
                      </button>
                      <button onClick={() => dispute(e.id)}
                        className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
                        <AlertTriangle className="w-3 h-3" /> Dispute
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
