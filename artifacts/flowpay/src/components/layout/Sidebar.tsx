import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import {
  Users,
  ArrowRightLeft,
  ShieldCheck,
  Sparkles,
  Bot,
  Wallet,
  LogOut,
  Zap,
  Grid2x2,
  Copy,
  CheckCheck,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/select", label: "All Modules", icon: Grid2x2 },
  { href: "/payroll", label: "PayRails", icon: Users },
  { href: "/remittance", label: "RemitDirect", icon: ArrowRightLeft },
  { href: "/escrow", label: "EscrowX", icon: ShieldCheck },
  { href: "/creator", label: "CreatorPay", icon: Sparkles },
  { href: "/agents", label: "AgentBank", icon: Bot },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

function truncateAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Sidebar() {
  const [location] = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.walletAddress
    ? user.walletAddress.slice(0, 2).toUpperCase()
    : "??";

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[#090909] border-r border-white/8 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/8">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/8 border border-white/15">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-base tracking-tight">FlowPay</span>
          <div className="text-[9px] text-white/30 font-mono leading-none mt-0.5">SOLANA · USDG</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = location === href || (href !== "/select" && location.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-white/8 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/4"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/8 space-y-1">
        {user && (
          <button
            onClick={copyAddress}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-white/6 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <span className="text-white/70 text-[10px] font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              {user.name && (
                <div className="text-xs text-white font-medium truncate">{user.name}</div>
              )}
              <div className="text-[10px] text-white/35 font-mono truncate">
                {truncateAddress(user.walletAddress)}
              </div>
            </div>
            {copied
              ? <CheckCheck className="w-3.5 h-3.5 text-white/60 shrink-0" />
              : <Copy className="w-3.5 h-3.5 text-white/20 shrink-0" />
            }
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/30 hover:text-white/60 transition-colors rounded-xl hover:bg-white/5"
        >
          <LogOut className="w-4 h-4" />
          Disconnect wallet
        </button>
      </div>
    </aside>
  );
}
