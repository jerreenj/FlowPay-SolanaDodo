import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { ArrowRight } from "lucide-react";

export default function Register() {
  const [, navigate] = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: "", email: "", password: "", userType: "freelancer", country: "IN" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setAuth(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden">
              <img src="/logo.avif" alt="FlowPay" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-bold text-2xl">FlowPay</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/50 text-sm mt-1">Join India's stablecoin payment layer</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-white/5 border border-white/15 text-white/70 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/60 font-medium uppercase tracking-wide">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} required
                className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 transition-all"
                placeholder="Rahul Sharma" />
            </div>

            <div>
              <label className="text-xs text-white/60 font-medium uppercase tracking-wide">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required
                className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 transition-all"
                placeholder="rahul@company.com" />
            </div>

            <div>
              <label className="text-xs text-white/60 font-medium uppercase tracking-wide">Password</label>
              <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required
                className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 transition-all"
                placeholder="••••••••" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 font-medium uppercase tracking-wide">I am a</label>
                <select value={form.userType} onChange={(e) => set("userType", e.target.value)}
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-all">
                  <option value="freelancer">Freelancer</option>
                  <option value="business">Business</option>
                  <option value="creator">Creator</option>
                  <option value="agent_owner">Agent Owner</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/60 font-medium uppercase tracking-wide">Country</label>
                <select value={form.country} onChange={(e) => set("country", e.target.value)}
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-all">
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="UAE">UAE</option>
                  <option value="UK">United Kingdom</option>
                  <option value="SG">Singapore</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-50 mt-2">
              {loading ? "Creating account…" : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              Already have an account?{" "}
              <Link href="/login" className="text-white/70 hover:text-white font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
