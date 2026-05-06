import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { X, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";

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

const WALLETS = [
  {
    id: "phantom",
    name: "Phantom",
    description: "Most popular Solana wallet",
    logo: "/wallets/phantom.png",
    bgColor: "#ab9ff2",
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
    logo: "/wallets/backpack.jpg",
    bgColor: "#000",
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
    logo: "/wallets/solflare.png",
    bgColor: "#FBBF24",
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

async function safePost(url: string, body: object) {
  const res = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, data };
}

interface Props {
  variant?: "default" | "hero" | "card";
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
    WALLETS.forEach((w) => { try { if (w.detect()) d.add(w.id); } catch { /* ignore */ } });
    setDetected(d);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setShowUsername(false); setError(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function attemptAuth(address: string, name?: string) {
    const { ok, status, data } = await safePost("/api/auth/wallet", {
      walletAddress: address,
      name: name ?? null,
    });
    if (status === 202 || (data as any)?.newUser) {
      setPendingAddress(address);
      setShowUsername(true);
      setUsername(name ?? "");
      return;
    }
    if (ok && data?.token && data?.user) {
      setAuth(data.token as string, data.user as any);
      setOpen(false);
      setShowUsername(false);
      setLocation("/select");
      return;
    }
    throw new Error((data.error as string) ?? "Authentication failed");
  }

  async function handleConnect(walletId: string) {
    const wallet = WALLETS.find((w) => w.id === walletId);
    if (!wallet) return;

    setLoading(walletId);
    setError(null);

    try {
      if (!wallet.detect()) {
        throw new Error(`${wallet.name} is not detected in this browser.`);
      }
      const address = await wallet.connect();
      if (!address) throw new Error("Connection cancelled or rejected");
      await attemptAuth(address);
    } catch (e: any) {
      const msg = e?.message ?? "";
      if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("cancelled")) {
        setError("You cancelled the connection. Try again.");
      } else {
        setError(msg || "Connection failed — try again");
      }
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

  const defaultBtn = (
    <button
      onClick={() => { setOpen(true); setError(null); }}
      className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/8 transition-all"
    >
      Connect Wallet
    </button>
  );

  const cardBtn = (
    <button
      onClick={() => { setOpen(true); setError(null); }}
      className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-white/90 transition-all"
    >
      Connect Wallet
    </button>
  );

  const heroBtn = (
    <button
      onClick={() => { setOpen(true); setError(null); }}
      className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full transition-all duration-300 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 0 24px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 40px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 24px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
      }}
    >
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        }}
      />
      <span className="relative text-white font-semibold text-base tracking-wide">
        Connect Wallet
      </span>
      <span className="relative text-white/50 text-lg leading-none group-hover:translate-x-0.5 transition-transform duration-200">
        →
      </span>
    </button>
  );

  return (
    <>
      {variant === "hero" ? heroBtn : variant === "card" ? cardBtn : defaultBtn}

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
                  <h2 className="font-bold text-white text-base">One last thing</h2>
                  <button onClick={() => { setShowUsername(false); setError(null); }} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-white/40 mb-5 leading-relaxed">
                  Pick a display name. It's the only information we store — no email, no password.
                </p>
                <input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitUsername(); }}
                  placeholder="e.g. satoshi"
                  maxLength={32}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition-all mb-3"
                />
                {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
                <button
                  onClick={submitUsername}
                  disabled={!username.trim() || loading === "username"}
                  className="w-full bg-white text-black font-bold text-sm py-3 rounded-xl disabled:opacity-40 hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  {loading === "username" && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enter FlowPay
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-white text-base">Connect your wallet</h2>
                    <p className="text-xs text-white/30 mt-0.5">Choose a Solana wallet to continue</p>
                  </div>
                  <button onClick={() => { setOpen(false); setError(null); }} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5">
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
                        <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: wallet.bgColor }}>
                          <img
                            src={wallet.logo}
                            alt={wallet.name}
                            className="w-10 h-10 object-cover rounded-xl"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{wallet.name}</span>
                            {isDetected && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                                Ready
                              </span>
                            )}
                            {!isDetected && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/25">
                                Not installed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/30 mt-0.5">{wallet.description}</p>
                        </div>

                        <div className="shrink-0">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                          ) : isDetected ? (
                            <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors" />
                          ) : (
                            <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/15">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

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
