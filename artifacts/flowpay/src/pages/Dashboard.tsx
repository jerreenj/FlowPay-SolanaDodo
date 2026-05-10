import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import {
  TrendingUp, Users, Zap, DollarSign, ArrowRightLeft, ShieldCheck, Sparkles, Bot, Activity, type LucideIcon,
} from "lucide-react";

const ACCENT = "#00ff88";

interface Stats {
  totalVolume: string;
  totalTransactions: number;
  totalFees: string;
  activeUsers: number;
  payrollVolume: string;
  remittanceVolume: string;
  escrowVolume: string;
  creatorVolume: string;
  agentVolume: string;
  avgSettlementSeconds: number;
}

interface ActivityItem {
  id: number;
  type: string;
  description: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

const MODULE_META = [
  { key: "payrollVolume",    label: "PayRails",    icon: Users,         accent: "#00ff88" },
  { key: "remittanceVolume", label: "RemitDirect", icon: ArrowRightLeft, accent: "#38bdf8" },
  { key: "escrowVolume",     label: "EscrowX",     icon: ShieldCheck,   accent: "#a78bfa" },
  { key: "creatorVolume",    label: "CreatorPay",  icon: Sparkles,      accent: "#f472b6" },
  { key: "agentVolume",      label: "AgentBank",   icon: Bot,           accent: "#fb923c" },
] as const;

const TYPE_META: Record<string, { color: string; bg: string }> = {
  payroll:    { color: "#00ff88", bg: "#00ff8810" },
  remittance: { color: "#38bdf8", bg: "#38bdf810" },
  escrow:     { color: "#a78bfa", bg: "#a78bfa10" },
  creator:    { color: "#f472b6", bg: "#f472b610" },
  agent:      { color: "#fb923c", bg: "#fb923c10" },
};

const TYPE_ICON: Record<string, LucideIcon> = {
  payroll: Users, remittance: ArrowRightLeft, escrow: ShieldCheck, creator: Sparkles, agent: Bot,
};

export default function Dashboard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const [s, a] = await Promise.all([
          apiFetch("/api/dashboard/stats", { headers }).then((r) => r.json()),
          apiFetch("/api/dashboard/activity", { headers }).then((r) => r.json()),
        ]);
        setStats(s);
        setActivity(a);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [token]);

  const maxVolume = stats
    ? Math.max(...MODULE_META.map((m) => parseFloat((stats as any)[m.key] ?? "0")))
    : 1;

  return (
    <AppLayout>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 65% 140% at 0% 0%, ${ACCENT}0d 0%, transparent 70%)` }} />
        <div className="relative z-10 px-8 pt-8 pb-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-[clamp(1.35rem,2.5vw,2rem)] font-bold text-white tracking-tight">Command Center</h1>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ACCENT }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: ACCENT }} />
                  </span>
                  <span className="text-xs font-mono" style={{ color: `${ACCENT}90` }}>LIVE</span>
                </div>
              </div>
              <p className="text-[13px] sm:text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.56)" }}>
                {user?.name ? `Welcome back, ${user.name.split(" ")[0]} —` : ""} Real-time Solana payment metrics across all 5 modules
              </p>
            </div>
            <div className="shrink-0 hidden md:flex flex-col items-end gap-1">
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Avg settlement</span>
              <span className="text-2xl font-bold font-mono" style={{ color: ACCENT }}>{stats?.avgSettlementSeconds ?? "—"}s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Top stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Volume", value: `$${parseFloat(stats?.totalVolume ?? "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "USDG settled on Solana", icon: DollarSign, colored: true },
              { label: "Transactions", value: (stats?.totalTransactions ?? 0).toLocaleString(), sub: "across all modules", icon: Activity, colored: false },
              { label: "Protocol Fees", value: `$${parseFloat(stats?.totalFees ?? "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "revenue generated", icon: TrendingUp, colored: true },
              { label: "Active Users", value: (stats?.activeUsers ?? 0).toLocaleString(), sub: "on FlowPay", icon: Users, colored: false },
            ].map(({ label, value, sub, icon: Icon, colored }) => (
              <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                  <div className="p-1.5 rounded-lg" style={{ background: colored ? `${ACCENT}10` : "rgba(255,255,255,0.05)" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: colored ? ACCENT : "rgba(255,255,255,0.35)" }} />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono tracking-tight" style={{ color: colored ? ACCENT : "white" }}>{value}</p>
                <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Module volume bar chart */}
        {!loading && stats && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>Volume by Module</p>
            <div className="space-y-4">
              {MODULE_META.map(({ key, label, icon: Icon, accent }) => {
                const vol = parseFloat((stats as any)[key] ?? "0");
                const pct = maxVolume > 0 ? (vol / maxVolume) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
                        <span className="text-sm text-white font-medium">{label}</span>
                      </div>
                      <span className="text-sm font-mono font-semibold" style={{ color: accent }}>
                        ${vol.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 8px ${accent}50` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live activity feed */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-2">
              <h2 className="text-[13px] font-semibold text-white">Live Activity</h2>
              <div className="flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ACCENT }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: ACCENT }} />
                </span>
              </div>
            </div>
            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{activity.length} transactions</span>
          </div>

          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {!loading && activity.length === 0 && (
              <div className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No activity yet — try sending a payment</div>
            )}
            {loading && [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.04)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 rounded" style={{ background: "rgba(255,255,255,0.05)", width: "60%" }} />
                  <div className="h-2.5 rounded" style={{ background: "rgba(255,255,255,0.03)", width: "40%" }} />
                </div>
                <div className="w-20 h-4 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
            {activity.map((item) => {
              const Icon = TYPE_ICON[item.type] ?? Activity;
              const meta = TYPE_META[item.type] ?? { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" };
              const isCompleted = item.status.toLowerCase() === "completed";
              return (
                <div key={item.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.015]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg, border: `1px solid ${meta.color}25` }}>
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-white">${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={isCompleted
                        ? { background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}25` }
                        : { background: "rgba(251,191,36,0.10)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.22)" }}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            <span>Powered by Solana</span>
          </div>
          <span>·</span>
          <span>USDG stablecoin</span>
          <span>·</span>
          <span>Dodo Payments rails</span>
          <span>·</span>
          <span>Superteam India × Solana Frontier</span>
        </div>
      </div>
    </AppLayout>
  );
}
