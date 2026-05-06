import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("demo@flowpay.in");
  const [password, setPassword] = useState("demo123");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setAuth(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center px-4">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden">
              <img src="/logo.avif" alt="FlowPay" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-bold text-2xl">FlowPay</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/50 text-sm mt-1">India's stablecoin payment super-layer</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-white/5 border border-white/15 text-white/70 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/60 font-medium uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="text-xs text-white/60 font-medium uppercase tracking-wide">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-11 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              Don't have an account?{" "}
              <Link href="/register" className="text-white/70 hover:text-white font-medium">Create one</Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-white/4 border border-white/10 rounded-lg">
            <p className="text-[11px] text-white/40 font-mono text-center">
              Demo: demo@flowpay.in / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
