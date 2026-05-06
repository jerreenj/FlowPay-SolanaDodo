import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import {
  TrendingUp, Users, Zap, DollarSign, ArrowRightLeft, ShieldCheck, Sparkles, Bot, Activity,
  ExternalLink
} from "lucide-react";

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

const typeColors: Record<string, string> = {
  payroll: "text-blue-400 bg-blue-400/10",
  remittance: "text-purple-400 bg-purple-400/10",
  escrow: "text-yellow-400 bg-yellow-400/10",
  creator: "text-pink-400 bg-pink-400/10",
  agent: "text-[#00ff88] bg-[#00ff88]/10",
};

const TypeIcon: Record<string, React.FC<{ className?: string }>> = {
  payroll: Users,
  remittance: ArrowRightLeft,
  escrow: ShieldCheck,
  creator: Sparkles,
  agent: Bot,
};

function StatCard({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub?: string; icon: any; accent?: boolean }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-white/50 uppercase tracking-wide font-medium">{label}</p>
        <div className={`p-2 rounded-lg ${accent ? "bg-[#00ff88]/10" : "bg-white/5"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-[#00ff88]" : "text-white/40"}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white font-mono">{value}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const token = useAuthStore((s) => s.token);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
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

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-white/50 text-sm mt-1">Real-time Solana payment metrics across all 5 modules</p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
          </span>
          <span className="text-xs text-[#00ff88] font-mono">LIVE · Solana Mainnet · ~2.3s settlement</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Volume" value={`$${parseFloat(stats?.totalVolume ?? "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="USDG settled on Solana" icon={DollarSign} accent />
              <StatCard label="Transactions" value={(stats?.totalTransactions ?? 0).toLocaleString()} sub="across all modules" icon={Activity} />
              <StatCard label="Protocol Fees" value={`$${parseFloat(stats?.totalFees ?? "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="revenue generated" icon={TrendingUp} accent />
              <StatCard label="Active Users" value={(stats?.activeUsers ?? 0).toLocaleString()} sub="on FlowPay" icon={Users} />
            </div>

            {/* Module volumes */}
            <div className="grid grid-cols-5 gap-3 mb-8">
              {[
                { label: "PayRails", value: stats?.payrollVolume ?? "0", color: "blue", icon: Users },
                { label: "RemitDirect", value: stats?.remittanceVolume ?? "0", color: "purple", icon: ArrowRightLeft },
                { label: "EscrowX", value: stats?.escrowVolume ?? "0", color: "yellow", icon: ShieldCheck },
                { label: "CreatorPay", value: stats?.creatorVolume ?? "0", color: "pink", icon: Sparkles },
                { label: "AgentBank", value: stats?.agentVolume ?? "0", color: "green", icon: Bot },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-2 text-white/40" />
                  <p className="text-xs text-white/50 mb-1">{label}</p>
                  <p className="text-sm font-bold text-white font-mono">${parseFloat(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Activity feed */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Live Activity</h2>
            <span className="text-xs text-white/40 font-mono">{activity.length} transactions</span>
          </div>
          <div className="divide-y divide-white/5">
            {activity.length === 0 && !loading && (
              <div className="px-6 py-8 text-center text-white/40 text-sm">No activity yet. Try sending a payment!</div>
            )}
            {activity.map((item) => {
              const Icon = TypeIcon[item.type] ?? Activity;
              const colorClass = typeColors[item.type] ?? "text-white/40 bg-white/10";
              return (
                <div key={item.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors">
                  <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.description}</p>
                    <p className="text-xs text-white/40 mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-[#00ff88]">${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.status === "completed" || item.status === "released"
                        ? "bg-[#00ff88]/10 text-[#00ff88]"
                        : item.status === "disputed"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>{item.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Solana info bar */}
        <div className="mt-6 flex items-center gap-3 text-xs text-white/30">
          <Zap className="w-3.5 h-3.5 text-[#00ff88]/50" />
          <span>Powered by Solana blockchain · USDG stablecoin · Dodo Payments rails</span>
          <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white/60 transition-colors">
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
