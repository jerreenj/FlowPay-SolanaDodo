import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  ShieldCheck,
  Sparkles,
  Bot,
  Wallet,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/payroll", label: "PayRails", icon: Users, badge: "0.5%" },
  { href: "/remittance", label: "RemitDirect", icon: ArrowRightLeft, badge: "0.75%" },
  { href: "/escrow", label: "EscrowX", icon: ShieldCheck, badge: "0.5%" },
  { href: "/creator", label: "CreatorPay", icon: Sparkles, badge: "2%" },
  { href: "/agents", label: "AgentBank", icon: Bot, badge: "1%" },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

export function Sidebar() {
  const [location] = useLocation();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#0a0a0a] border-r border-white/10 shrink-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/30">
          <Zap className="w-4 h-4 text-[#00ff88]" />
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight">FlowPay</span>
          <div className="text-[10px] text-[#00ff88] font-mono leading-none">SOLANA · USDG</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = location === href || location.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded",
                  isActive ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-white/10 text-white/40"
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 mb-2">
          <div className="w-7 h-7 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
            <span className="text-[#00ff88] text-xs font-bold">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white font-medium truncate">Demo User</div>
            <div className="text-[10px] text-white/40 truncate">demo@flowpay.in</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/50 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
