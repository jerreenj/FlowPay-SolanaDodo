import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Wallet as WalletIcon, Copy, TrendingUp, TrendingDown, ArrowRightLeft, Zap } from "lucide-react";

interface WalletData {
  id: number;
  userId: number;
  address: string;
  usdgBalance: string;
  inrBalance: string;
  totalReceived: string;
  totalSent: string;
  createdAt: string;
}

export default function WalletPage() {
  const token = useAuthStore((s) => s.token);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [rate, setRate] = useState(83.52);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [w, r] = await Promise.all([
          apiFetch("/api/wallet", { headers }).then((res) => res.json()),
          apiFetch("/api/rates").then((res) => res.json()),
        ]);
        setWallet(w);
        if (r.usdgToInr) setRate(r.usdgToInr);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [token]);

  function copyAddress() {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const usdgBalance = parseFloat(wallet?.usdgBalance ?? "0");
  const inrEquivalent = (usdgBalance * rate).toFixed(2);

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <WalletIcon className="w-5 h-5 text-white/60" />
          <h1 className="text-2xl font-bold text-white">Wallet</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-xl animate-pulse" />)}
            </div>
          </div>
        ) : wallet ? (
          <div className="max-w-2xl">
            {/* Balance card */}
            <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
              <div className="mb-6">
                <p className="text-sm text-white/50 mb-1">USDG Balance</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold text-white font-mono">{usdgBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-2xl text-white/50 font-semibold mb-1">USDG</span>
                </div>
                <p className="text-white/40 mt-1">≈ ₹{parseFloat(inrEquivalent).toLocaleString()} INR</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40 mb-1">Solana Wallet Address</p>
                  <p className="text-sm font-mono text-white/70 truncate">{wallet.address}</p>
                </div>
                <button onClick={copyAddress}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                    copied ? "border-white/30 bg-white/10 text-white" : "border-white/20 bg-white/5 text-white/50 hover:text-white/80"
                  }`}>
                  <Copy className="w-3 h-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Received", value: `$${parseFloat(wallet.totalReceived).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-white" },
                { label: "Total Sent", value: `$${parseFloat(wallet.totalSent).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: "text-white/60" },
                { label: "INR Balance", value: `₹${parseFloat(wallet.inrBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: ArrowRightLeft, color: "text-white/70" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <p className="text-xs text-white/50">{label}</p>
                  </div>
                  <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Exchange rate */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Live Exchange Rates</h3>
              <div className="space-y-2">
                {[
                  { pair: "USDG / INR", rate: rate.toFixed(2) },
                  { pair: "USDG / USD", rate: "1.00" },
                  { pair: "USDG / AED", rate: "3.67" },
                  { pair: "USDG / GBP", rate: "0.79" },
                ].map(({ pair, rate: r }) => (
                  <div key={pair} className="flex items-center justify-between">
                    <span className="text-sm text-white/60 font-mono">{pair}</span>
                    <span className="text-sm text-white font-mono font-semibold">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Solana info */}
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Zap className="w-3.5 h-3.5 text-white/20" />
              <span>Transactions settle on Solana mainnet in &lt;3 seconds · USDG is 1:1 USD pegged</span>
            </div>
          </div>
        ) : (
          <div className="text-white/40 text-sm">Wallet not found. Please log in again.</div>
        )}
      </div>
    </AppLayout>
  );
}
