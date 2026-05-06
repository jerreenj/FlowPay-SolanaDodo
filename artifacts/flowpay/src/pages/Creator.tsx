import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { Sparkles, Plus, ShoppingCart, TrendingUp } from "lucide-react";

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
  creatorName: string;
  buyerName: string;
  buyerEmail: string;
  amountUsdg: string;
  feeUsdg: string;
  creatorReceives: string;
  solanaSignature: string | null;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  course: "Course",
  ebook: "eBook",
  template: "Template",
  newsletter: "Newsletter",
  membership: "Membership",
};

const typeColors: Record<string, string> = {
  course: "bg-white/8 text-white/60",
  ebook: "bg-white/8 text-white/60",
  template: "bg-white/8 text-white/60",
  newsletter: "bg-white/8 text-white/60",
  membership: "bg-white/8 text-white/60",
};

export default function Creator() {
  const token = useAuthStore((s) => s.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buyForm, setBuyForm] = useState({ buyerName: "", buyerEmail: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({ creatorName: "", title: "", description: "", type: "course", priceUsdg: "" });
  const [tab, setTab] = useState<"marketplace" | "sales">("marketplace");

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    try {
      const [p, s] = await Promise.all([
        apiFetch("/api/creator/products", { headers: authHeaders }).then((r) => r.json()),
        apiFetch("/api/creator/sales", { headers: authHeaders }).then((r) => r.json()),
      ]);
      setProducts(p);
      setSales(s);
    } catch { /* ignore */ }
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
      if (!res.ok) throw new Error();
      setShowForm(false);
      setNewProduct({ creatorName: "", title: "", description: "", type: "course", priceUsdg: "" });
      await load();
    } catch { /* ignore */ }
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
      if (!res.ok) throw new Error();
      setBuyingId(null);
      setBuyForm({ buyerName: "", buyerEmail: "" });
      await load();
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  const setNP = (k: string, v: string) => setNewProduct((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-white/60" />
              <h1 className="text-2xl font-bold text-white">CreatorPay</h1>
              <span className="text-xs bg-white/8 text-white/50 border border-white/12 px-2 py-0.5 rounded-full font-mono">2% fee</span>
            </div>
            <p className="text-white/50 text-sm">Sell digital products in USDG — instant settlement, no chargebacks</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white hover:bg-white/90 text-black text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> List Product
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-lg w-fit">
          {(["marketplace", "sales"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors capitalize ${tab === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>
              {t === "marketplace" ? "Marketplace" : `Sales (${sales.length})`}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-5">List New Product</h2>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Creator Name</label>
                <input value={newProduct.creatorName} onChange={(e) => setNP("creatorName", e.target.value)} required placeholder="Ankur Warikoo"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Type</label>
                <select value={newProduct.type} onChange={(e) => setNP("type", e.target.value)}
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all">
                  {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wide">Title</label>
                <input value={newProduct.title} onChange={(e) => setNP("title", e.target.value)} required placeholder="Build Your Startup: Complete Guide"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wide">Description</label>
                <textarea value={newProduct.description} onChange={(e) => setNP("description", e.target.value)} required rows={2}
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all resize-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide">Price (USDG)</label>
                <input type="number" min="0.01" step="0.01" value={newProduct.priceUsdg} onChange={(e) => setNP("priceUsdg", e.target.value)} required placeholder="29.00"
                  className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all" />
                {newProduct.priceUsdg && (
                  <p className="text-xs text-white/40 mt-1">You receive ${(parseFloat(newProduct.priceUsdg || "0") * 0.98).toFixed(4)} USDG after 2% fee</p>
                )}
              </div>
              <div className="flex flex-col justify-end">
                <button type="submit" disabled={submitting}
                  className="bg-white hover:bg-white/90 text-black text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? "Listing…" : "List Product"}
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === "marketplace" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? [...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
            )) : products.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[p.type] ?? "bg-white/10 text-white/50"}`}>
                        {typeLabels[p.type] ?? p.type}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm leading-tight">{p.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">by {p.creatorName}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xl font-bold text-white font-mono">${parseFloat(p.priceUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-white/40">{p.salesCount} sold</p>
                  </div>
                </div>
                <p className="text-xs text-white/50 mb-4 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <TrendingUp className="w-3 h-3" />
                    <span>${parseFloat(p.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })} earned</span>
                  </div>
                  {buyingId === p.id ? (
                    <div className="flex items-end gap-2">
                      <div className="space-y-1">
                        <input value={buyForm.buyerName} onChange={(e) => setBuyForm((f) => ({ ...f, buyerName: e.target.value }))} placeholder="Your name"
                          className="w-28 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-white/30" />
                        <input value={buyForm.buyerEmail} onChange={(e) => setBuyForm((f) => ({ ...f, buyerEmail: e.target.value }))} placeholder="your@email.com"
                          className="w-28 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-white/30" />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleBuy(p.id)} disabled={submitting || !buyForm.buyerName || !buyForm.buyerEmail}
                          className="bg-white hover:bg-white/90 text-black text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50">
                          {submitting ? "…" : "Buy"}
                        </button>
                        <button onClick={() => setBuyingId(null)} className="text-white/40 hover:text-white/70 text-xs px-2 py-1.5">✕</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setBuyingId(p.id); setBuyForm({ buyerName: "", buyerEmail: "" }); }}
                      className="flex items-center gap-1.5 text-xs bg-white/8 hover:bg-white/12 text-white/60 border border-white/12 px-3 py-1.5 rounded-lg transition-colors">
                      <ShoppingCart className="w-3 h-3" /> Purchase
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {sales.length === 0 ? (
                <div className="px-6 py-10 text-center text-white/40 text-sm">No sales yet</div>
              ) : sales.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{s.buyerName} purchased "{s.productTitle}"</p>
                    <p className="text-xs text-white/40 mt-0.5">by {s.creatorName} · {new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-white">${parseFloat(s.amountUsdg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-white/40">creator gets ${parseFloat(s.creatorReceives).toFixed(4)}</p>
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
