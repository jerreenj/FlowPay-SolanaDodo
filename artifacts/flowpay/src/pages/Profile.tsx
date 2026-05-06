import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { UserCircle, CheckCircle, Copy, CheckCheck, Pencil, X, Zap } from "lucide-react";

const ACCENT = "#00ff88";

export default function Profile() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      setUser(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  function copyAddress() {
    if (!user?.walletAddress) return;
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "FP";
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—";

  return (
    <AppLayout>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 65% 140% at 0% 0%, ${ACCENT}0d 0%, transparent 70%)` }} />
        <div className="relative z-10 flex items-start gap-4 px-8 pt-8 pb-7">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 20px ${ACCENT}18` }}>
            <UserCircle className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <h1 className="text-[clamp(1.35rem,2.5vw,2rem)] font-bold text-white tracking-tight">Profile</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>identity</span>
            </div>
            <p className="text-[13px] sm:text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.56)" }}>
              Your display name is auto-filled as the sender / creator name across all payment modules
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-xl">
        {/* Avatar + name card */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ACCENT}18` }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 70% at 0% 0%, ${ACCENT}07 0%, transparent 70%)` }} />
          <div className="relative z-10 flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold transition-all duration-500" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, color: ACCENT, boxShadow: `0 0 24px ${ACCENT}14` }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Display Name</p>
              <p className="text-xl font-bold text-white truncate">{user?.name ?? "—"}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Member since {memberSince}</p>
            </div>
            {!editing && (
              <button
                onClick={() => { setEditing(true); setNameInput(user?.name ?? ""); setError(null); }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all shrink-0"
                style={{ background: `${ACCENT}10`, color: ACCENT, border: `1px solid ${ACCENT}25` }}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </div>

        {/* Saved banner */}
        {saved && (
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5" style={{ background: `${ACCENT}09`, border: `1px solid ${ACCENT}25` }}>
            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
            <p className="text-sm text-white">Name updated — all modules will now pre-fill with your new name.</p>
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Change Display Name</h2>
              <button onClick={() => { setEditing(false); setError(null); }} style={{ color: "rgba(255,255,255,0.25)" }} className="hover:text-white/50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>New Display Name</label>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                />
                <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  This name will be pre-filled as "Sender Name" / "Creator Name" in all payment forms.
                </p>
              </div>
              {error && (
                <div className="rounded-lg px-3 py-2.5 text-sm" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving || !nameInput.trim() || nameInput.trim() === user?.name}
                  className="flex-1 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ background: ACCENT, color: "#000" }}
                >
                  {saving ? "Saving…" : "Save Name"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setError(null); }}
                  className="px-5 text-sm rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Wallet address card */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Solana Wallet</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-white/70 truncate">{user?.walletAddress ?? "—"}</p>
            </div>
            <button
              onClick={copyAddress}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all shrink-0"
              style={copied
                ? { background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>How Your Name Is Used</p>
          <div className="space-y-3">
            {[
              { module: "PayRails", field: "Sender Name", color: "#00ff88" },
              { module: "RemitDirect", field: "Sender Name", color: "#38bdf8" },
              { module: "EscrowX", field: "Client Name", color: "#a78bfa" },
              { module: "CreatorPay", field: "Creator Name", color: "#f472b6" },
              { module: "AgentBank", field: "Agent Owner", color: "#fb923c" },
            ].map(({ module, field, color }) => (
              <div key={module} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-medium text-white">{module}</span>
                </div>
                <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>pre-fills "{field}"</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Zap className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>You can still override the name in any individual form</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
