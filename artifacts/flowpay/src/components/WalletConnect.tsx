import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Wallet, X, ChevronRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
    backpack?: { solana?: BackpackProvider };
    solflare?: SolflareProvider;
    coinbaseSolana?: CoinbaseProvider;
  }
}

interface PhantomProvider {
  isPhantom?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  publicKey?: { toString: () => string } | null;
}

interface BackpackProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  publicKey?: { toString: () => string } | null;
}

interface SolflareProvider {
  connect: () => Promise<void>;
  publicKey?: { toString: () => string } | null;
}

interface CoinbaseProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  publicKey?: { toString: () => string } | null;
}

const WALLETS = [
  {
    id: "phantom",
    name: "Phantom",
    description: "Most popular Solana wallet",
    color: "#ab9ff2",
    icon: (
      <svg viewBox="0 0 128 128" className="w-6 h-6" fill="none">
        <rect width="128" height="128" rx="26" fill="#ab9ff2"/>
        <path d="M110.9 64C110.9 84.4 93.6 101 72.3 101H55.8C52.9 101 50.6 98.7 50.6 95.8C50.6 92.9 52.9 90.6 55.8 90.6H72.3C87.8 90.6 100.5 78.6 100.5 64C100.5 49.4 87.8 37.4 72.3 37.4H48.2C45.8 37.4 43.8 39.2 43.8 41.6L43.8 80.2C43.8 83.1 41.5 85.4 38.6 85.4C35.7 85.4 33.4 83.1 33.4 80.2V41.6C33.4 33.7 39.8 27.4 48.2 27.4H72.3C93.6 27 110.9 43.6 110.9 64Z" fill="white"/>
        <circle cx="64" cy="56" r="8" fill="white"/>
        <circle cx="86" cy="56" r="8" fill="white"/>
      </svg>
    ),
    detect: () => !!(window.phantom?.solana?.isPhantom || (window.solana?.isPhantom)),
    connect: async () => {
      const provider = window.phantom?.solana ?? window.solana;
      if (!provider?.isPhantom) return null;
      const { publicKey } = await provider.connect();
      return publicKey.toString();
    },
    installUrl: "https://phantom.app",
  },
  {
    id: "backpack",
    name: "Backpack",
    description: "xNFT wallet by Coral",
    color: "#e33e3f",
    icon: (
      <svg viewBox="0 0 128 128" className="w-6 h-6" fill="none">
        <rect width="128" height="128" rx="26" fill="#e33e3f"/>
        <path d="M64 24C45.2 24 30 39.2 30 58C30 70.3 36.6 81.1 46.4 87.5V104H81.6V87.5C91.4 81.1 98 70.3 98 58C98 39.2 82.8 24 64 24Z" fill="white" opacity="0.9"/>
        <rect x="52" y="18" width="24" height="14" rx="7" fill="white"/>
      </svg>
    ),
    detect: () => !!window.backpack?.solana,
    connect: async () => {
      const provider = window.backpack?.solana;
      if (!provider) return null;
      const { publicKey } = await provider.connect();
      return publicKey.toString();
    },
    installUrl: "https://backpack.app",
  },
  {
    id: "solflare",
    name: "Solflare",
    description: "Feature-rich Solana wallet",
    color: "#fc8b27",
    icon: (
      <svg viewBox="0 0 128 128" className="w-6 h-6" fill="none">
        <rect width="128" height="128" rx="26" fill="#fc8b27"/>
        <path d="M64 20L94 60H34L64 20Z" fill="white"/>
        <path d="M64 108L34 68H94L64 108Z" fill="white" opacity="0.7"/>
      </svg>
    ),
    detect: () => !!window.solflare,
    connect: async () => {
      const provider = window.solflare;
      if (!provider) return null;
      await provider.connect();
      return provider.publicKey?.toString() ?? null;
    },
    installUrl: "https://solflare.com",
  },
];

interface Props {
  variant?: "default" | "hero" | "card";
}

export default function WalletConnect({ variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [detectedWallets, setDetectedWallets] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);
  const { token, setAuth } = useAuthStore();

  useEffect(() => {
    if (token) return;
    const detected = new Set<string>();
    WALLETS.forEach((w) => { if (w.detect()) detected.add(w.id); });
    setDetectedWallets(detected);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setShowUsernamePrompt(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleConnect(walletId: string) {
    const wallet = WALLETS.find((w) => w.id === walletId);
    if (!wallet) return;

    if (!wallet.detect()) {
      window.open(wallet.installUrl, "_blank");
      return;
    }

    setLoading(walletId);
    setError(null);
    try {
      const address = await wallet.connect();
      if (!address) throw new Error("Connection cancelled");
      await attemptAuth(address);
    } catch (e: any) {
      setError(e.message ?? "Connection failed");
    } finally {
      setLoading(null);
    }
  }

  async function attemptAuth(address: string, name?: string) {
    const res = await fetch("/api/auth/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address, name: name ?? null }),
    });
    const data = await res.json();

    if (res.ok) {
      setAuth(data.token, data.user);
      setOpen(false);
      setShowUsernamePrompt(false);
      setLocation("/select");
    } else if (res.status === 202) {
      // New user, needs username
      setPendingAddress(address);
      setShowUsernamePrompt(true);
    } else {
      throw new Error(data.error ?? "Auth failed");
    }
  }

  async function submitUsername() {
    if (!pendingAddress || !username.trim()) return;
    setLoading("username");
    setError(null);
    try {
      await attemptAuth(pendingAddress, username.trim());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  if (token) return null;

  const btnClass = variant === "hero"
    ? "flex items-center gap-2.5 bg-[#00ff88] hover:bg-[#00e87a] text-black font-bold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00ff88]/20"
    : variant === "card"
    ? "flex items-center gap-2 bg-[#00ff88] hover:bg-[#00e87a] text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
    : "flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all";

  return (
    <>
      <button onClick={() => setOpen(true)} className={btnClass}>
        <Wallet className={variant === "hero" ? "w-5 h-5" : "w-4 h-4"} />
        Connect Wallet
        {variant === "hero" && <ChevronRight className="w-4 h-4" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setOpen(false); setShowUsernamePrompt(false); }}
          />
          <div
            ref={modalRef}
            className="relative z-10 w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {showUsernamePrompt ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-white">Choose a username</h2>
                  <button onClick={() => setShowUsernamePrompt(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-white/40 mb-4">
                  Wallet connected. Pick a display name — this is the only info we store.
                </p>
                <input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitUsername(); }}
                  placeholder="e.g. satoshi"
                  maxLength={32}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#00ff88]/40 focus:ring-1 focus:ring-[#00ff88]/20 mb-3"
                />
                {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
                <button
                  onClick={submitUsername}
                  disabled={!username.trim() || loading === "username"}
                  className="w-full bg-[#00ff88] hover:bg-[#00e87a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading === "username" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Enter FlowPay
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-white">Connect a Solana wallet</h2>
                  <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {WALLETS.map((wallet) => {
                    const isDetected = detectedWallets.has(wallet.id);
                    const isLoading = loading === wallet.id;
                    return (
                      <button
                        key={wallet.id}
                        onClick={() => handleConnect(wallet.id)}
                        disabled={!!loading}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 disabled:opacity-50 transition-all text-left group"
                      >
                        <div className="shrink-0">{wallet.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{wallet.name}</span>
                            {isDetected && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00ff88]/15 text-[#00ff88]">
                                Detected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/35">{wallet.description}</p>
                        </div>
                        <div className="shrink-0 text-white/30 group-hover:text-white/60 transition-colors">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isDetected ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <span className="text-[10px] text-white/25">Install</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {error && (
                  <p className="text-xs text-red-400 mt-3 px-1">{error}</p>
                )}
                <p className="text-[10px] text-white/20 text-center mt-4 leading-relaxed">
                  By connecting, you accept our terms. Your wallet address is your identity — no email required.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
