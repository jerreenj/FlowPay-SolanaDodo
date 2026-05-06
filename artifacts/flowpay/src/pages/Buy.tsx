import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { apiFetch } from "@/lib/apiFetch";
import { Sparkles, CheckCircle, Copy, CheckCheck, ArrowLeft, Zap, ShieldCheck, Clock } from "lucide-react";

const ACCENT = "#f472b6";

interface Product {
  id: number;
  creatorName: string;
  title: string;
  description: string;
  type: string;
  priceUsdg: string;
  salesCount: number;
  totalRevenue: string;
  isActive: string;
  createdAt: string;
}

interface Sale {
  id: number;
  productTitle: string;
  buyerName: string;
  amountUsdg: string;
  feeUsdg: string;
  creatorReceives: string;
  solanaSignature: string | null;
}

const typeLabels: Record<string, string> = {
  course: "Course", ebook: "eBook", template: "Template",
  newsletter: "Newsletter", membership: "Membership",
};
const typeAccent: Record<string, string> = {
  course: "#f472b6", ebook: "#a78bfa", template: "#38bdf8",
  newsletter: "#fb923c", membership: "#4ade80",
};

function truncateSig(sig: string | null) {
  if (!sig) return "—";
  return sig.slice(0, 12) + "…" + sig.slice(-12);
}

export default function Buy() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id ?? "0", 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ buyerName: "", buyerEmail: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!productId) { setNotFound(true); setLoading(false); return; }
    apiFetch(`/api/creator/products/${productId}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return; }
        return r.json();
      })
      .then((data) => { if (data) setProduct(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/creator/products/${product.id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Purchase failed"); return; }
      setSale(data);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  const tc = product ? (typeAccent[product.type] ?? ACCENT) : ACCENT;
  const inrEquiv = product ? (parseFloat(product.priceUsdg) * 83.52).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#070707" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${ACCENT}40`, borderTopColor: ACCENT }} />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center" style={{ background: "#070707" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
          <Sparkles className="w-8 h-8" style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Product not found</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>This product may have been removed or the link is invalid.</p>
        </div>
        <Link href="/">
          <a className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <ArrowLeft className="w-4 h-4" /> Back to FlowPay
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#070707" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#00ff8815", border: "1px solid #00ff8825" }}>
            <Zap className="w-3.5 h-3.5" style={{ color: "#00ff88" }} />
          </div>
          <span className="text-sm font-bold text-white">FlowPay</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "#00ff8810", color: "#00ff88", border: "1px solid #00ff8820" }}>CreatorPay</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#00ff88" }} /><span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#00ff88" }} /></span>
          SOLANA MAINNET
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {sale ? (
          /* ── Success State ── */
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "#4ade8015", border: "1px solid #4ade8030", boxShadow: "0 0 40px #4ade8020" }}>
              <CheckCircle className="w-10 h-10" style={{ color: "#4ade80" }} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Complete!</h1>
            <p className="mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>Your purchase has been settled on the Solana blockchain.</p>

            <div className="rounded-2xl p-6 mb-6 text-left max-w-md mx-auto" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Product</span>
                  <span className="text-sm text-white font-medium">{sale.productTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Buyer</span>
                  <span className="text-sm text-white">{sale.buyerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Amount Paid</span>
                  <span className="text-sm font-mono font-bold text-white">${parseFloat(sale.amountUsdg).toFixed(2)} USDG</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Creator Receives</span>
                  <span className="text-sm font-mono" style={{ color: "#4ade80" }}>${parseFloat(sale.creatorReceives).toFixed(4)} USDG</span>
                </div>
                {sale.solanaSignature && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} className="pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Solana Tx</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>{truncateSig(sale.solanaSignature)}</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(sale.solanaSignature ?? ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                          style={{ color: copied ? "#4ade80" : "rgba(255,255,255,0.3)" }}
                        >
                          {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link href="/creator">
              <a className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all" style={{ background: ACCENT, color: "#000" }}>
                Explore More Products
              </a>
            </Link>
          </div>
        ) : (
          /* ── Checkout State ── */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Product info */}
            <div className="md:col-span-3">
              <div className="mb-2">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full" style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}25` }}>
                  {typeLabels[product.type] ?? product.type}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mt-4 mb-3 leading-tight">{product.title}</h1>
              <p className="text-base mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>by <span className="text-white font-medium">{product.creatorName}</span></p>
              <p className="mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{product.description}</p>

              {/* Trust indicators */}
              <div className="space-y-3">
                {[
                  { icon: Zap, text: "Instant delivery — settled on Solana in &lt;3 seconds", color: "#00ff88" },
                  { icon: ShieldCheck, text: "Zero chargebacks — USDG stablecoin, immutable on-chain", color: "#a78bfa" },
                  { icon: Clock, text: `${product.salesCount} people have already purchased this`, color: "#38bdf8" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }} dangerouslySetInnerHTML={{ __html: text }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout card */}
            <div className="md:col-span-2">
              <div className="rounded-2xl overflow-hidden sticky top-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
                {/* Price header */}
                <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: `linear-gradient(135deg, ${tc}06 0%, transparent 100%)` }}>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Price</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-white font-mono">${parseFloat(product.priceUsdg).toFixed(2)}</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>USDG</p>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>≈ ₹{inrEquiv} INR</p>
                </div>

                {/* Form */}
                <form onSubmit={handlePurchase} className="p-5 space-y-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Your Name</label>
                    <input
                      value={form.buyerName}
                      onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
                      required placeholder="Full name"
                      className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                      onFocus={(e) => (e.target.style.borderColor = `${tc}50`)}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Email Address</label>
                    <input
                      type="email"
                      value={form.buyerEmail}
                      onChange={(e) => setForm((f) => ({ ...f, buyerEmail: e.target.value }))}
                      required placeholder="you@email.com"
                      className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                      onFocus={(e) => (e.target.style.borderColor = `${tc}50`)}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg px-3 py-2.5 text-sm" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !form.buyerName || !form.buyerEmail}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    style={{ background: tc, color: "#000" }}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                        Settling on Solana…
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Pay ${parseFloat(product.priceUsdg).toFixed(2)} USDG
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.28)" }}>
                    Powered by FlowPay · Solana blockchain · USDG stablecoin
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
