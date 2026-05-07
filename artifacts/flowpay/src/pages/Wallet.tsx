import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Wallet as WalletIcon, Copy, CheckCheck, TrendingUp, TrendingDown, ArrowRightLeft, Zap } from "lucide-react";

const ACCENT = "#00ff88";

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

const RATES = [
  { pair: "USDG / INR", key: "usdgToInr", decimals: 2 },
  { pair: "USDG / USD", key: "usdgToUsd", decimals: 2 },
  { pair: "USDG / AED", key: "usdgToAed", decimals: 2 },
  { pair: "USDG / GBP", key: "usdgToGbp", decimals: 2 },
] as const;

export default function WalletPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({ usdgToInr: 83.52, usdgToUsd: 1.00, usdgToAed: 3.67, usdgToGbp: 0.79 });
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
        if (r) setRates((prev) => ({ ...prev, ...r }));
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
  const inrEquivalent = (usdgBalance * (rates.usdgToInr ?? 83.52));

  return (
    <AppLayout>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 65% 140% at 0% 0%, ${ACCENT}0d 0%, transparent 70%)` }} />
        <div className="relative z-10 flex items-start justify-between pl-14 pr-8 pt-6 pb-5 min-w-0 gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 20px ${ACCENT}18` }}>
              <WalletIcon className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-[clamp(1.35rem,2.5vw,2rem)] font-bold text-white tracking-tight">Wallet</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>USDG</span>
              </div>
              <p className="text-[13px] sm:text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.56)" }}>
                {user?.name ? `${user.name}'s` : "Your"} Solana wallet — stablecoin balance &amp; exchange rates
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="h-52 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }} />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }} />)}
            </div>
          </div>
        ) : wallet ? (
          <div className="max-w-4xl mx-auto">
            {/* Balance card */}
            <div className="relative overflow-hidden rounded-2xl p-8 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ACCENT}18`, boxShadow: `0 0 40px ${ACCENT}06` }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 70% at 0% 0%, ${ACCENT}08 0%, transparent 70%)` }} />
              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>USDG Balance</p>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-5xl font-bold text-white font-mono tracking-tight">{usdgBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-xl font-semibold mb-1.5" style={{ color: ACCENT }}>USDG</span>
                </div>
                <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>≈ ₹{inrEquivalent.toLocaleString("en-IN", { maximumFractionDigits: 0 })} INR</p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0 rounded-xl px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Solana Address</p>
                    <p className="text-sm font-mono truncate text-white/70">{wallet.address}</p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all shrink-0"
                    style={copied
                      ? { background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}35` }
                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Received", value: `$${parseFloat(wallet.totalReceived).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, accent: "#4ade80" },
                { label: "Total Sent",     value: `$${parseFloat(wallet.totalSent).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,     icon: TrendingDown, accent: "#f87171" },
                { label: "INR Balance",    value: `₹${parseFloat(wallet.inrBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,     icon: ArrowRightLeft, accent: "#38bdf8" },
              ].map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg" style={{ background: `${accent}10` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
                    </div>
                    <p className="text-[13px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</p>
                  </div>
                  <p className="text-2xl font-bold font-mono" style={{ color: accent === "#f87171" ? "white" : accent }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Exchange rates */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ACCENT }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: ACCENT }} />
                  </span>
                </div>
                <h3 className="text-[13px] font-semibold text-white">Live Exchange Rates</h3>
              </div>
              <div className="space-y-3">
                {RATES.map(({ pair, key, decimals }) => {
                  const val = rates[key];
                  return (
                    <div key={pair} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-[16px] font-mono font-semibold" style={{ color: "rgba(255,255,255,0.80)" }}>{pair}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[20px] font-mono font-bold text-white">{val?.toFixed(decimals) ?? "—"}</span>
                        {pair === "USDG / INR" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}10`, color: ACCENT }}>LIVE</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
              <Zap className="w-3 h-3" />
              <span>Transactions settle on Solana mainnet in &lt;3 seconds · USDG is 1:1 USD pegged</span>
            </div>
          </div>
        ) : (
          <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Wallet not found. Please log in again.</div>
        )}
      </div>
    </AppLayout>
  );
}
