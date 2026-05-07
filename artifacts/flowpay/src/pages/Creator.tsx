import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Sparkles, Plus, ShoppingCart, TrendingUp, Copy, CheckCheck, ExternalLink, X, BookOpen, FileText, Layout, Mail, Users } from "lucide-react";

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
  dodoProductId: string | null;
  createdAt: string;
}

interface Sale {
  id: number;
  productTitle: string;
  creatorName: string;
  buyerName: string;
  buyerEmail: string;
  amountUsdg: string;
  creatorReceives: string;
  dodoPaymentStatus: string;
  dodoCheckoutUrl: string | null;
  createdAt: string;
}

const TYPE_CFG: Record<string, { label: string; icon: typeof BookOpen; grad: string; accent: string }> = {
  course:     { label: "Course",     icon: BookOpen, grad: "linear-gradient(135deg,#f472b615,#a78bfa15)", accent: "#f472b6" },
  ebook:      { label: "eBook",      icon: FileText, grad: "linear-gradient(135deg,#a78bfa15,#38bdf815)", accent: "#a78bfa" },
  template:   { label: "Template",   icon: Layout,   grad: "linear-gradient(135deg,#38bdf815,#4ade8015)", accent: "#38bdf8" },
  newsletter: { label: "Newsletter", icon: Mail,     grad: "linear-gradient(135deg,#fb923c15,#f472b615)", accent: "#fb923c" },
  membership: { label: "Membership", icon: Users,    grad: "linear-gradient(135deg,#4ade8015,#38bdf815)", accent: "#4ade80" },
};

function ShareModal({ productId, productTitle, onClose }: { productId: number; productTitle: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/buy/${productId}`;
  function copy() { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="w-96 rounded-2xl p-6 mx-4" style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.12)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between mb-4">
          <div><h2 className="text-[14px] font-bold text-white">Share & Sell</h2><p className="text-[13px] mt-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.68)" }}>{productTitle}</p></div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.3)" }}><X className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: ACCENT }} />
          <span className="text-[13px] font-mono flex-1 truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{url}</span>
          <button onClick={copy} style={{ color: copied ? ACCENT : "rgba(255,255,255,0.3)" }}>
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[13px] mb-4 font-medium" style={{ color: "rgba(255,255,255,0.62)" }}>Anyone with this link can purchase — no account required.</p>
        <button onClick={copy} className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-2.5 rounded-xl" style={{ background: ACCENT, color: "#000" }}>
          {copied ? <><CheckCheck className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Share Link</>}
        </button>
      </div>
    </div>
  );
}

export default function Creator() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buyForm, setBuyForm] = useState({ buyerName: "", buyerEmail: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({ creatorName: user?.name ?? "", title: "", description: "", type: "course", priceUsdg: "" });
  const [tab, setTab] = useState<"products" | "sales">("products");
  const [shareProduct, setShareProduct] = useState<Product | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const [p, s] = await Promise.all([
        apiFetch("/api/creator/products", { headers: authHeaders }).then((r) => r.json()),
        apiFetch("/api/creator/sales", { headers: authHeaders }).then((r) => r.json()),
      ]);
      setProducts(p); setSales(s);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await apiFetch("/api/creator/products", { method: "POST", headers: authHeaders, body: JSON.stringify(newProduct) });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setShowForm(false);
      setNewProduct({ creatorName: user?.name ?? "", title: "", description: "", type: "course", priceUsdg: "" });
      await load();
      setShareProduct(data);
    } catch {}
    finally { setSubmitting(false); }
  }

  async function handleBuy(productId: number) {
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/creator/products/${productId}/purchase`, { method: "POST", headers: authHeaders, body: JSON.stringify(buyForm) });
      const data = await res.json();
      if (!res.ok) throw new Error();
      if (data.dodoCheckoutUrl) { window.location.href = data.dodoCheckoutUrl; return; }
      setBuyingId(null); setBuyForm({ buyerName: "", buyerEmail: "" }); await load();
    } catch {}
    finally { setSubmitting(false); }
  }

  const setNP = (k: string, v: string) => setNewProduct((f) => ({ ...f, [k]: v }));
  const totalRevenue = sales.reduce((s, r) => s + parseFloat(r.creatorReceives || "0"), 0);
  const paidSales = sales.filter((s) => s.dodoPaymentStatus === "paid").length;

  return (
    <AppLayout>
      {shareProduct && <ShareModal productId={shareProduct.id} productTitle={shareProduct.title} onClose={() => setShareProduct(null)} />}

      <div className="flex flex-col" style={{ height: "100vh" }}>
        {/* ── Compact header ── */}
        <div className="shrink-0 flex items-center gap-4 pl-14 pr-6 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
            <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-white">CreatorPay</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>2% fee</span>
            </div>
            <p className="text-[13px] leading-tight font-semibold" style={{ color: "rgba(255,255,255,0.72)" }}>Sell digital products · instant USDG settlement</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {[
              { label: "products", value: products.length },
              { label: "paid sales", value: paidSales },
              { label: "earned", value: `$${totalRevenue.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[18px] font-bold font-mono text-white leading-none">{value}</p>
                <p className="text-[13px] mt-1 font-semibold capitalize" style={{ color: "rgba(255,255,255,0.62)" }}>{label}</p>
              </div>
            ))}
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-2 rounded-xl ml-2" style={{ background: ACCENT, color: "#000" }}>
              <Plus className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>

        {/* ── Full-width scrollable content ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* List product form */}
          {showForm && (
            <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <div className="flex justify-between mb-4">
                <div><p className="text-[13px] font-bold text-white">List New Product</p><p className="text-[12px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Get a shareable checkout link instantly via Dodo</p></div>
                <button onClick={() => setShowForm(false)} style={{ color: "rgba(255,255,255,0.25)" }}><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreateProduct} className="grid grid-cols-4 gap-3">
                <input value={newProduct.creatorName} onChange={(e) => setNP("creatorName", e.target.value)} required placeholder="Creator name"
                  className="col-span-1 rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                <input value={newProduct.title} onChange={(e) => setNP("title", e.target.value)} required placeholder="Product title"
                  className="col-span-2 rounded-xl px-3 py-2 text-white text-[13px] outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                <select value={newProduct.type} onChange={(e) => setNP("type", e.target.value)}
                  className="col-span-1 rounded-xl px-3 py-2 text-[13px] outline-none"
                  style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}>
                  {Object.entries(TYPE_CFG).map(([v, { label }]) => <option key={v} value={v} style={{ background: "#1c1c1c", color: "white" }}>{label}</option>)}
                </select>
                <textarea value={newProduct.description} onChange={(e) => setNP("description", e.target.value)} required rows={2}
                  placeholder="What does the buyer get? Be specific."
                  className="col-span-3 rounded-xl px-3 py-2 text-white text-[13px] outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                <div>
                  <input type="number" min="0.01" step="0.01" value={newProduct.priceUsdg} onChange={(e) => setNP("priceUsdg", e.target.value)} required placeholder="Price (USDG)"
                    className="w-full rounded-xl px-3 py-2 text-white text-[13px] outline-none font-mono"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.target.style.borderColor = `${ACCENT}55`)} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                  {newProduct.priceUsdg && <p className="text-[12px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.62)" }}>You get ${(parseFloat(newProduct.priceUsdg) * 0.98).toFixed(2)}</p>}
                </div>
                <button type="submit" disabled={submitting} className="col-span-4 text-[13px] font-bold py-2.5 rounded-xl disabled:opacity-50" style={{ background: ACCENT, color: "#000" }}>
                  {submitting ? "Listing on Dodo…" : "List Product & Get Share Link"}
                </button>
              </form>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl w-fit mb-5" style={{ background: "rgba(255,255,255,0.04)" }}>
            {(["products", "sales"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 text-[12px] rounded-lg font-medium transition-all capitalize"
                style={tab === t ? { background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}28` } : { color: "rgba(255,255,255,0.4)" }}>
                {t === "products" ? `Products (${products.length})` : `Sales (${sales.length})`}
              </button>
            ))}
          </div>

          {tab === "products" ? (
            <div>
              {loading ? (
                <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />)}</div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl py-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.12)" }} />
                  <p className="text-[15px] font-semibold text-white mb-1">List your first product</p>
                  <p className="text-sm max-w-sm mx-auto font-medium" style={{ color: "rgba(255,255,255,0.62)" }}>Click "List" above — get a Dodo checkout link and a shareable /buy/:id URL instantly. Anyone can purchase, no account needed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((p) => {
                    const cfg = TYPE_CFG[p.type] ?? TYPE_CFG.course;
                    const Icon = cfg.icon;
                    return (
                      <div key={p.id} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        {/* Gradient header */}
                        <div className="px-5 pt-5 pb-4" style={{ background: cfg.grad }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cfg.accent}22`, border: `1px solid ${cfg.accent}35` }}>
                              <Icon className="w-5 h-5" style={{ color: cfg.accent }} />
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold font-mono text-white">${parseFloat(p.priceUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                              <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.60)" }}>USDG</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${cfg.accent}20`, color: cfg.accent, border: `1px solid ${cfg.accent}28` }}>{cfg.label}</span>
                          {p.dodoProductId && <span className="ml-1.5 text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.09)" }}>Dodo ✓</span>}
                        </div>
                        {/* Body */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-white font-semibold text-[14px] leading-snug mb-0.5">{p.title}</h3>
                          <p className="text-[13px] mb-1 font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>by {p.creatorName}</p>
                          <p className="text-[13px] mb-3 flex-1 line-clamp-2 font-medium" style={{ color: "rgba(255,255,255,0.72)" }}>{p.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.60)" }}>
                              <TrendingUp className="w-3 h-3" /> {p.salesCount} sold · ${parseFloat(p.totalRevenue).toFixed(2)} earned
                            </span>
                            <button onClick={() => setShareProduct(p)} className="text-[13px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
                              <ExternalLink className="w-3 h-3" /> Share
                            </button>
                          </div>
                          {buyingId === p.id ? (
                            <div className="space-y-2">
                              <input value={buyForm.buyerName} onChange={(e) => setBuyForm((f) => ({ ...f, buyerName: e.target.value }))} placeholder="Your name"
                                className="w-full rounded-lg px-3 py-1.5 text-white text-[12px] outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
                              <input value={buyForm.buyerEmail} onChange={(e) => setBuyForm((f) => ({ ...f, buyerEmail: e.target.value }))} placeholder="your@email.com"
                                className="w-full rounded-lg px-3 py-1.5 text-white text-[12px] outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
                              <div className="flex gap-2">
                                <button onClick={() => handleBuy(p.id)} disabled={submitting || !buyForm.buyerName || !buyForm.buyerEmail}
                                  className="flex-1 text-[12px] font-bold py-1.5 rounded-lg disabled:opacity-50" style={{ background: ACCENT, color: "#000" }}>
                                  {submitting ? "…" : "Buy via Dodo"}
                                </button>
                                <button onClick={() => setBuyingId(null)} className="px-3 text-[12px] rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>✕</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setBuyingId(p.id); setBuyForm({ buyerName: "", buyerEmail: "" }); }}
                              className="w-full flex items-center justify-center gap-1.5 text-[12px] font-medium py-2 rounded-xl"
                              style={{ background: `${cfg.accent}14`, color: cfg.accent, border: `1px solid ${cfg.accent}22` }}>
                              <ShoppingCart className="w-3.5 h-3.5" /> Purchase
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="grid grid-cols-4 gap-4 px-5 py-2.5 text-[12px] uppercase tracking-widest font-semibold" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.58)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="col-span-2">Sale</span><span>Dodo Status</span><span className="text-right">Amount</span>
              </div>
              {sales.length === 0 ? (
                <div className="py-12 text-center"><p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No sales yet — share your product links to start selling</p></div>
              ) : sales.map((s, i) => (
                <div key={s.id} className="grid grid-cols-4 gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}>
                  <div className="col-span-2 min-w-0">
                    <p className="text-[13px] text-white">{s.buyerName} <span style={{ color: "rgba(255,255,255,0.4)" }}>bought</span> "{s.productTitle}"</p>
                    <p className="text-[12px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>by {s.creatorName} · {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold px-1.5 py-0.5 rounded-full" style={
                      s.dodoPaymentStatus === "paid" ? { background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" } :
                      s.dodoPaymentStatus === "failed" ? { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" } :
                      { background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)" }
                    }>{s.dodoPaymentStatus}</span>
                    {s.dodoCheckoutUrl && <a href={s.dodoCheckoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-mono font-semibold text-white">${parseFloat(s.amountUsdg).toFixed(2)}</p>
                    <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.58)" }}>You: ${parseFloat(s.creatorReceives).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
