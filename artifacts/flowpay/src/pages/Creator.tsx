import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Sparkles, Plus, ShoppingCart, TrendingUp, Copy, CheckCheck, ExternalLink, X } from "lucide-react";

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
  feeUsdg: string;
  creatorReceives: string;
  solanaSignature: string | null;
  dodoSessionId: string | null;
  dodoCheckoutUrl: string | null;
  dodoPaymentStatus: string;
  createdAt: string;
}

function DodoStatusChip({ status }: { status: string }) {
  if (status === "paid") {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.30)", color: "#4ade80" }}>
        Paid
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.30)", color: "#f87171" }}>
        Failed
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.30)", color: "#fb923c" }}>
      Pending
    </span>
  );
}

const typeLabels: Record<string, string> = {
  course: "Course",
  ebook: "eBook",
  template: "Template",
  newsletter: "Newsletter",
  membership: "Membership",
};

const typeAccent: Record<string, string> = {
  course: "#f472b6",
  ebook: "#a78bfa",
  template: "#38bdf8",
  newsletter: "#fb923c",
  membership: "#4ade80",
};

function ShareModal({ productId, productTitle, onClose }: { productId: number; productTitle: string; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/buy/${productId}`;
  const embedCode = `<script src="${baseUrl}/embed.js" data-product="${productId}"></script>`;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.12)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-[15px]">Share & Sell</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{productTitle}</p>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Direct Buy Link</p>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: ACCENT }} />
              <span className="text-xs font-mono text-white/70 flex-1 truncate">{shareUrl}</span>
              <button onClick={() => copy(shareUrl, "url")} className="shrink-0 transition-colors" style={{ color: copied === "url" ? ACCENT : "rgba(255,255,255,0.25)" }}>
                {copied === "url" ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Anyone with this link can purchase directly — no account needed</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Embed on WHOP / Gumroad</p>
              <button onClick={() => copy(embedCode, "embed")} className="flex items-center gap-1 text-[11px] transition-colors" style={{ color: copied === "embed" ? ACCENT : "rgba(255,255,255,0.35)" }}>
                {copied === "embed" ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "embed" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="rounded-xl px-4 py-3 font-mono text-[11px] text-white/50 overflow-auto" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {embedCode}
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Paste into any HTML page — renders a buy button with Solana checkout</p>
          </div>

          <button
            onClick={() => copy(shareUrl, "cta")}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl transition-all"
            style={{ background: ACCENT, color: "#000" }}
          >
            {copied === "cta" ? <><CheckCheck className="w-4 h-4" /> Link Copied!</> : <><Copy className="w-4 h-4" /> Copy Share Link</>}
          </button>
        </div>
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
  const [tab, setTab] = useState<"marketplace" | "sales">("marketplace");
  const [shareProduct, setShareProduct] = useState<Product | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const [p, s] = await Promise.all([
        apiFetch("/api/creator/products", { headers: authHeaders }).then((r) => r.json()),
        apiFetch("/api/creator/sales", { headers: authHeaders }).then((r) => r.json()),
      ]);
      setProducts(p);
      setSales(s);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/creator/products", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setShowForm(false);
      setNewProduct({ creatorName: "", title: "", description: "", type: "course", priceUsdg: "" });
      await load();
      setShareProduct(data);
    } catch { }
    finally { setSubmitting(false); }
  }

  async function handleBuy(productId: number) {
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/creator/products/${productId}/purchase`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(buyForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      // If Dodo returned a real checkout URL, redirect there
      if (data.dodoCheckoutUrl) {
        window.location.href = data.dodoCheckoutUrl;
        return;
      }
      setBuyingId(null);
      setBuyForm({ buyerName: "", buyerEmail: "" });
      await load();
    } catch { }
    finally { setSubmitting(false); }
  }

  const setNP = (k: string, v: string) => setNewProduct((f) => ({ ...f, [k]: v }));
  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.creatorReceives || "0"), 0);

  return (
    <AppLayout>
      {shareProduct && <ShareModal productId={shareProduct.id} productTitle={shareProduct.title} onClose={() => setShareProduct(null)} />}

      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 65% 140% at 0% 0%, ${ACCENT}10 0%, transparent 70%)` }} />
        <div className="relative z-10 flex items-start justify-between px-8 pt-8 pb-7 min-w-0 gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 20px ${ACCENT}18` }}>
              <Sparkles className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div className="min-w-0 max-w-[54rem]">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-[clamp(1.35rem,2.5vw,2rem)] font-bold text-white tracking-tight">CreatorPay</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>2% fee</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.10)" }}>Dodo Payments</span>
              </div>
              <p className="text-[13px] sm:text-sm leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.56)" }}>Sell digital products in USDG — instant settlement via Dodo, zero chargebacks</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all shrink-0"
            style={{ background: ACCENT, color: "#000" }}>
            <Plus className="w-4 h-4" /> List Product
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Products Listed", value: products.length.toString(), colored: true },
            { label: "Total Sales", value: sales.length.toString(), colored: false },
            { label: "Revenue Earned", value: `$${totalRevenue.toFixed(2)}`, colored: false },
          ].map(({ label, value, colored }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
              <p className="text-2xl font-bold font-mono tracking-tight" style={{ color: colored ? ACCENT : "white" }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["marketplace", "sales"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize"
              style={tab === t ? { background: ACCENT + "20", color: ACCENT, border: `1px solid ${ACCENT}30` } : { color: "rgba(255,255,255,0.4)" }}>
              {t === "marketplace" ? "Marketplace" : `Sales (${sales.length})`}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">List New Product</h2>
              <button onClick={() => setShowForm(false)} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Creator Name</label>
                <input value={newProduct.creatorName} onChange={(e) => setNP("creatorName", e.target.value)} required placeholder="Ankur Warikoo"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Type</label>
                <select value={newProduct.type} onChange={(e) => setNP("type", e.target.value)}
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Title</label>
                <input value={newProduct.title} onChange={(e) => setNP("title", e.target.value)} required placeholder="Build Your Startup: Complete Guide"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Description</label>
                <textarea value={newProduct.description} onChange={(e) => setNP("description", e.target.value)} required rows={2}
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Price (USDG)</label>
                <input type="number" min="0.01" step="0.01" value={newProduct.priceUsdg} onChange={(e) => setNP("priceUsdg", e.target.value)} required placeholder="29.00"
                  className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.target.style.borderColor = `${ACCENT}50`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                {newProduct.priceUsdg && (
                  <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>You receive ${(parseFloat(newProduct.priceUsdg || "0") * 0.98).toFixed(4)} USDG after 2% fee</p>
                )}
              </div>
              <div className="flex flex-col justify-end">
                <button type="submit" disabled={submitting}
                  className="text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ background: ACCENT, color: "#000" }}>
                  {submitting ? "Listing…" : "List & Get Share Link"}
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === "marketplace" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? [...Array(4)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }} />
            )) : products.length === 0 ? (
              <div className="col-span-2 rounded-2xl px-6 py-12 text-center text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}>
                No products listed yet
              </div>
            ) : products.map((p) => {
              const tc = typeAccent[p.type] ?? ACCENT;
              return (
                <div key={p.id} className="rounded-2xl p-5 transition-all" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}25` }}>
                          {typeLabels[p.type] ?? p.type}
                        </span>
                        {p.dodoProductId && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.10)" }}>
                            Dodo ✓
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-[15px] leading-tight">{p.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>by {p.creatorName}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-2xl font-bold text-white font-mono">${parseFloat(p.priceUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{p.salesCount} sold</p>
                    </div>
                  </div>
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: "rgba(255,255,255,0.48)" }}>{p.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        <TrendingUp className="w-3 h-3" />
                        <span>${parseFloat(p.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })} earned</span>
                      </div>
                      <button
                        onClick={() => setShareProduct(p)}
                        className="flex items-center gap-1 text-xs transition-colors"
                        style={{ color: ACCENT }}
                      >
                        <ExternalLink className="w-3 h-3" /> Share
                      </button>
                    </div>
                    {buyingId === p.id ? (
                      <div className="flex items-end gap-2">
                        <div className="space-y-1">
                          <input value={buyForm.buyerName} onChange={(e) => setBuyForm((f) => ({ ...f, buyerName: e.target.value }))} placeholder="Your name"
                            className="w-28 rounded px-2 py-1 text-white text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }} />
                          <input value={buyForm.buyerEmail} onChange={(e) => setBuyForm((f) => ({ ...f, buyerEmail: e.target.value }))} placeholder="your@email.com"
                            className="w-28 rounded px-2 py-1 text-white text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }} />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleBuy(p.id)} disabled={submitting || !buyForm.buyerName || !buyForm.buyerEmail}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                            style={{ background: ACCENT, color: "#000" }}>
                            {submitting ? "…" : "Buy"}
                          </button>
                          <button onClick={() => setBuyingId(null)} className="text-xs px-2 py-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setBuyingId(p.id); setBuyForm({ buyerName: "", buyerEmail: "" }); }}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                        <ShoppingCart className="w-3 h-3" /> Purchase
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Column headers */}
            <div className="flex items-center gap-4 px-6 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <p className="flex-1 text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Sale</p>
              <p className="w-52 shrink-0 text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Dodo</p>
              <p className="w-28 shrink-0 text-right text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Amount</p>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {sales.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No sales yet</div>
              ) : sales.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                  {/* Sale info column */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{s.buyerName} <span style={{ color: "rgba(255,255,255,0.45)" }}>purchased</span> "{s.productTitle}"</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>by {s.creatorName} · {new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  {/* Dodo column */}
                  <div className="w-52 shrink-0">
                    {s.dodoSessionId ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, color: ACCENT }}>Dodo ✓</span>
                          <DodoStatusChip status={s.dodoPaymentStatus ?? "pending"} />
                        </div>
                        {s.dodoCheckoutUrl ? (
                          <a
                            href={s.dodoCheckoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-mono truncate transition-opacity hover:opacity-70"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                            title={s.dodoSessionId}
                          >
                            <span className="truncate">{s.dodoSessionId}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-[11px] font-mono truncate" style={{ color: "rgba(255,255,255,0.35)" }} title={s.dodoSessionId}>{s.dodoSessionId}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                    )}
                  </div>
                  {/* Amount column */}
                  <div className="w-28 text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-white">${parseFloat(s.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs mt-0.5" style={{ color: ACCENT }}>+${parseFloat(s.creatorReceives).toFixed(4)} earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
