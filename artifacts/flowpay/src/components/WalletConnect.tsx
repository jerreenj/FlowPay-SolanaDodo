import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Wallet, X, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
    backpack?: { solana?: BackpackProvider };
    solflare?: SolflareProvider;
  }
}
interface PhantomProvider {
  isPhantom?: boolean;
  connect: (o?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  publicKey?: { toString: () => string } | null;
}
interface BackpackProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  publicKey?: { toString: () => string } | null;
}
interface SolflareProvider {
  isSolflare?: boolean;
  connect: () => Promise<void>;
  publicKey?: { toString: () => string } | null;
}

// Real brand logos as accurate SVG paths
const PhantomLogo = () => (
  <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
    <rect width="128" height="128" rx="22" fill="#9945FF"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M110.584 64.9142C110.584 86.0582 93.8938 103.197 73.2898 103.197H56.7102C51.1028 103.197 46.5521 98.5225 46.5521 92.7642C46.5521 86.0036 40.5499 80.4822 33.3489 80.4822C27.2014 80.4822 22.2162 75.8082 22.2162 70.0499V64.9142C22.2162 43.7702 38.9062 26.6313 59.5102 26.6313H73.2898C93.8938 26.6313 110.584 43.7702 110.584 64.9142ZM68.8182 52.5455C68.8182 55.6892 66.3529 58.2363 63.3013 58.2363C60.2496 58.2363 57.7843 55.6892 57.7843 52.5455C57.7843 49.4017 60.2496 46.8546 63.3013 46.8546C66.3529 46.8546 68.8182 49.4017 68.8182 52.5455ZM88.6494 52.5455C88.6494 55.6892 86.1841 58.2363 83.1325 58.2363C80.0808 58.2363 77.6156 55.6892 77.6156 52.5455C77.6156 49.4017 80.0808 46.8546 83.1325 46.8546C86.1841 46.8546 88.6494 49.4017 88.6494 52.5455Z" fill="white"/>
  </svg>
);

const BackpackLogo = () => (
  <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
    <rect width="128" height="128" rx="22" fill="#E33E3F"/>
    <path d="M55 30C55 25.0294 59.0294 21 64 21C68.9706 21 73 25.0294 73 30V33H82C88.6274 33 94 38.3726 94 45V93C94 99.6274 88.6274 105 82 105H46C39.3726 105 34 99.6274 34 93V45C34 38.3726 39.3726 33 46 33H55V30Z" fill="white" fillOpacity="0.9"/>
    <rect x="55" y="21" width="18" height="14" rx="6" fill="white" fillOpacity="0.9"/>
    <rect x="34" y="60" width="60" height="5" rx="2.5" fill="#E33E3F"/>
  </svg>
);

const SolflareLogo = () => (
  <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
    <rect width="128" height="128" rx="22" fill="#FC8B27"/>
    <path d="M64 18L74.5 44.5L102 42L82 62L90 89L64 74L38 89L46 62L26 42L53.5 44.5L64 18Z" fill="white" fillOpacity="0.95"/>
    <circle cx="64" cy="65" r="14" fill="#FC8B27"/>
    <circle cx="64" cy="65" r="8" fill="white" fillOpacity="0.9"/>
  </svg>
);

const WALLETS = [
  {
    id: "phantom",
    name: "Phantom",
    description: "Most popular Solana wallet",
    logo: <PhantomLogo />,
    detect: () => !!(window.phantom?.solana?.isPhantom || window.solana?.isPhantom),
    connect: async (): Promise<string | null> => {
      const p = window.phantom?.solana ?? window.solana;
      if (!p?.isPhantom) return null;
      const { publicKey } = await p.connect();
      return publicKey.toString();
    },
    installUrl: "https://phantom.app",
  },
  {
    id: "backpack",
    name: "Backpack",
    description: "xNFT wallet by Coral",
    logo: <BackpackLogo />,
    detect: () => !!window.backpack?.solana,
    connect: async (): Promise<string | null> => {
      const p = window.backpack?.solana;
      if (!p) return null;
      const { publicKey } = await p.connect();
      return publicKey.toString();
    },
    installUrl: "https://backpack.app",
  },
  {
    id: "solflare",
    name: "Solflare",
    description: "Feature-rich Solana wallet",
    logo: <SolflareLogo />,
    detect: () => !!(window.solflare?.isSolflare),
    connect: async (): Promise<string | null> => {
      const p = window.solflare;
      if (!p) return null;
      await p.connect();
      return p.publicKey?.toString() ?? null;
    },
    installUrl: "https://solflare.com",
  },
];

interface Props {
  variant?: "default" | "hero" | "card";
}

async function safePost(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* empty */ }
  return { ok: res.ok, status: res.status, data };
}

export default function WalletConnect({ variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUsername, setShowUsername] = useState(false);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [detected, setDetected] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();
  const { token, setAuth } = useAuthStore();

  useEffect(() => {
    if (!open) return;
    const d = new Set<string>();
    WALLETS.forEach((w) => { if (w.detect()) d.add(w.id); });
    setDetected(d);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setShowUsername(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function attemptAuth(address: string, name?: string) {
    const { ok, status, data } = await safePost("/api/auth/wallet", {
      walletAddress: address,
      name: name ?? null,
    });
    if (ok) {
      setAuth(data.token as string, data.user as any);
      setOpen(false);
      setShowUsername(false);
      setLocation("/select");
    } else if (status === 202) {
      setPendingAddress(address);
      setShowUsername(true);
    } else {
      throw new Error((data.error as string) ?? "Authentication failed");
    }
  }

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
      if (!address) throw new Error("Connection cancelled or rejected");
      await attemptAuth(address);
    } catch (e: any) {
      setError(e?.message ?? "Connection failed — try again");
    } finally {
      setLoading(null);
    }
  }

  async function submitUsername() {
    if (!pendingAddress || !username.trim()) return;
    setLoading("username");
    setError(null);
    try {
      await attemptAuth(pendingAddress, username.trim());
    } catch (e: any) {
      setError(e?.message ?? "Failed to create account");
    } finally {
      setLoading(null);
    }
  }

  if (token) return null;

  const btnClass =
    variant === "hero"
      ? "inline-flex items-center gap-2.5 bg-white text-black font-bold text-sm px-8 py-4 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-150 shadow-lg"
      : variant === "card"
      ? "inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-white/90 transition-all"
      : "inline-flex items-center gap-2 border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/8 transition-all";

  return (
    <>
      <button onClick={() => setOpen(true)} className={btnClass}>
        <Wallet className="w-4 h-4" />
        Connect Wallet
        {variant === "hero" && <ChevronRight className="w-4 h-4" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => { setOpen(false); setShowUsername(false); setError(null); }}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#111]">
            {showUsername ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-white">Choose a username</h2>
                  <button onClick={() => setShowUsername(false)} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-white/40 mb-4 leading-relaxed">
                  Wallet connected. Pick a display name — the only information we store.
                </p>
                <input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitUsername(); }}
                  placeholder="e.g. satoshi"
                  maxLength={32}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 mb-3 transition-all"
                />
                {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
                <button
                  onClick={submitUsername}
                  disabled={!username.trim() || loading === "username"}
                  className="w-full bg-white text-black font-bold text-sm py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  {loading === "username" && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enter FlowPay
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-white">Connect a Solana wallet</h2>
                  <button onClick={() => { setOpen(false); setError(null); }} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {WALLETS.map((wallet) => {
                    const isDetected = detected.has(wallet.id);
                    const isLoading = loading === wallet.id;
                    return (
                      <button
                        key={wallet.id}
                        onClick={() => handleConnect(wallet.id)}
                        disabled={!!loading}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/7 hover:border-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left group"
                      >
                        <div className="shrink-0 rounded-xl overflow-hidden">{wallet.logo}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{wallet.name}</span>
                            {isDetected && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                                Detected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/30">{wallet.description}</p>
                        </div>
                        <div className="shrink-0">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                          ) : isDetected ? (
                            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                          ) : (
                            <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {error && <p className="text-xs text-red-400 mt-3 px-1">{error}</p>}
                <p className="text-[10px] text-white/15 text-center mt-5 leading-relaxed">
                  Your wallet address is your identity. No email. No password.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
