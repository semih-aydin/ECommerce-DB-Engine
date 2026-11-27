"use client";

import { useEffect, useState } from "react";
import {
  Percent,
  PackagePlus,
  Edit3,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  Plus,
  EyeOff,
} from "lucide-react";
import { getProductImage } from "@/lib/productImages";

function formatTL(val) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(val || 0));
}

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [visibleCount, setVisibleCount] = useState(60);

  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  const [discountCatId, setDiscountCatId] = useState("");
  const [discountRate, setDiscountRate] = useState("10");
  const [discountConfirmOpen, setDiscountConfirmOpen] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCode, setNewProdCode] = useState("");
  const [newProdCatId, setNewProdCatId] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("25");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);

  const [feedback, setFeedback] = useState(null);

  async function loadInventory() {
    const res = await fetch(`/api/products?critical=${onlyCritical}`);
    const json = await res.json();
    setProducts(json.products || []);
    const cats = (json.categories || []).filter((c) => c.parent_id !== null);
    setCategories(cats);
    if (cats.length > 0 && !discountCatId) {
      setDiscountCatId(String(cats[0].id));
      setNewProdCatId(String(cats[0].id));
    }
  }

  useEffect(() => {
    loadInventory();
  }, [onlyCritical]);

  async function handlePriceUpdate(productId) {
    setFeedback(null);
    const res = await fetch(`/api/products/${productId}/price`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ basePrice: Number(newPrice) }),
    });
    const data = await res.json();

    if (!res.ok) {
      setFeedback({ type: "error", text: data.error });
    } else {
      setFeedback({ type: "success", text: data.message });
      setEditingId(null);
      await loadInventory();
    }
  }

  async function handleRestock(productId, amount = 15) {
    setFeedback(null);
    const res = await fetch(`/api/inventory/${productId}/restock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({ type: "success", text: data.message });
      await loadInventory();
    } else {
      setFeedback({ type: "error", text: data.error || "Stok güncellenemedi." });
    }
  }

  function handleBulkDiscountClick(e) {
    e.preventDefault();
    const rate = Number(discountRate);
    if (!rate || rate <= 0 || rate > 90) {
      setFeedback({ type: "error", text: "İndirim oranı 1 ile 90 arasında olmalıdır." });
      return;
    }
    setDiscountConfirmOpen(true);
  }

  async function executeBulkDiscount() {
    setApplyingDiscount(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/products/bulk-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: Number(discountCatId),
          discountRate: Number(discountRate),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error });
      } else {
        setFeedback({ type: "success", text: data.message });
        await loadInventory();
      }
    } finally {
      setApplyingDiscount(false);
      setDiscountConfirmOpen(false);
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    setCreatingProduct(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          productCode: newProdCode,
          categoryId: Number(newProdCatId || categories[0]?.id),
          basePrice: Number(newProdPrice),
          stockQuantity: Number(newProdStock),
          description: newProdDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error });
      } else {
        setFeedback({ type: "success", text: data.message });
        setAddModalOpen(false);
        setNewProdName("");
        setNewProdCode("");
        setNewProdPrice("");
        setNewProdDesc("");
        await loadInventory();
      }
    } finally {
      setCreatingProduct(false);
    }
  }

  async function handleDeactivate(productId) {
    setFeedback(null);
    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error });
    } else {
      setFeedback({ type: "success", text: data.message });
      await loadInventory();
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.product_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Apple Hero Header + Yeni Urun + Toplu Indirim */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#6E6E73] mb-1">
            Stok & Fiyat Kontrolü · trg_audit_product_price_change
          </p>
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1D1D1F] leading-tight">
            Ürün & Stok Yönetimi
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1D1D1F] hover:bg-[#333336] text-white text-[13px] font-medium transition-colors cursor-pointer"
          >
            <Plus size={15} />
            Yeni Ürün
          </button>

          <form
            onSubmit={handleBulkDiscountClick}
            className="flex flex-wrap items-center gap-2 bg-white border border-black/[0.08] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-3 py-2 rounded-2xl sm:rounded-full"
          >
            <span className="text-[12px] font-medium text-[#6E6E73] pl-1.5">
              Toplu İndirim:
            </span>
            <select
              value={discountCatId}
              onChange={(e) => setDiscountCatId(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] border border-black/[0.06] text-[12px] font-medium text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex items-center bg-[#F5F5F7] border border-black/[0.06] rounded-full px-2.5 py-1.5">
              <input
                type="number"
                min="1"
                max="90"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                className="w-10 bg-transparent text-[12px] font-semibold text-[#1D1D1F] tabular-nums text-center focus:outline-none"
              />
              <span className="text-[12px] text-[#6E6E73]">%</span>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[12px] font-medium transition-colors cursor-pointer"
            >
              <Percent size={13} />
              Uygula
            </button>
          </form>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-2xl border flex items-center gap-3 text-[13px] font-medium ${
            feedback.type === "success"
              ? "bg-[#EAF8EE] border-[#34C759]/30 text-[#248A3D]"
              : "bg-[#FFEBE9] border-[#FF3B30]/30 text-[#D70015]"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Arama ve Segmented Kritik Stok Filtresi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
          />
          <input
            type="text"
            placeholder="Ürün adı veya PRD kodu ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-black/[0.08] text-[13px] text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition-all"
          />
        </div>

        <div className="inline-flex items-center gap-1 bg-[#E8E8ED] p-1 rounded-full self-start sm:self-auto">
          <button
            onClick={() => setOnlyCritical(false)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
              !onlyCritical
                ? "bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#6E6E73] hover:text-[#1D1D1F]"
            }`}
          >
            Tüm Ürünler
          </button>
          <button
            onClick={() => setOnlyCritical(true)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
              onlyCritical
                ? "bg-white text-[#D70015] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#6E6E73] hover:text-[#1D1D1F]"
            }`}
          >
            Kritik Stoklar
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFAFC] text-[#86868B] text-[11px] uppercase tracking-wider">
                <th className="px-5 py-3.5 font-medium">Ürün</th>
                <th className="px-5 py-3.5 font-medium">Kategori</th>
                <th className="px-5 py-3.5 font-medium text-right">Stok / Eşik</th>
                <th className="px-5 py-3.5 font-medium text-right">Baz Fiyat</th>
                <th className="px-5 py-3.5 font-medium text-right">Hızlı İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-[#86868B]">
                    Eşleşen ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, visibleCount).map((p) => {
                  const isCritical = p.stock_quantity <= p.reorder_threshold;
                  const isEditing = editingId === p.id;
                  const imgSrc = p.image_url || getProductImage(p.name, p.category_name);

                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAFC] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] border border-black/[0.05] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={imgSrc}
                              alt={p.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#1D1D1F] truncate max-w-[320px]">
                              {p.name}
                            </div>
                            <div className="text-[11px] font-mono text-[#86868B] mt-0.5">
                              {p.product_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#6E6E73] text-[11px] font-medium">
                          {p.category_name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
                            isCritical
                              ? "bg-[#FFEBE9] text-[#D70015]"
                              : "bg-[#F5F5F7] text-[#1D1D1F]"
                          }`}
                        >
                          {p.stock_quantity}
                        </span>{" "}
                        <span className="text-[12px] text-[#86868B] ml-1">
                          / {p.reorder_threshold}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-28 px-2.5 py-1 rounded-lg bg-[#F5F5F7] border border-[#0071E3] text-[13px] font-medium text-right text-[#1D1D1F] focus:outline-none"
                            />
                            <button
                              onClick={() => handlePriceUpdate(p.id)}
                              className="w-7 h-7 rounded-full bg-[#34C759] text-white flex items-center justify-center hover:opacity-90 cursor-pointer"
                              title="Kaydet"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="w-7 h-7 rounded-full bg-[#F5F5F7] text-[#6E6E73] flex items-center justify-center hover:text-[#1D1D1F] cursor-pointer"
                              title="İptal"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="font-semibold text-[#1D1D1F]">
                            {formatTL(p.base_price)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setNewPrice(String(p.base_price));
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[12px] font-medium transition-colors cursor-pointer"
                          >
                            <Edit3 size={12} className="text-[#6E6E73]" />
                            Fiyat
                          </button>
                          <button
                            onClick={() => handleRestock(p.id, 15)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF8EE] hover:bg-[#D8F3DF] text-[#248A3D] text-[12px] font-medium transition-colors cursor-pointer"
                          >
                            <PackagePlus size={12} />
                            +15 Stok
                          </button>
                          <button
                            onClick={() => handleDeactivate(p.id)}
                            title="Ürünü pasife al"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FFEBE9] hover:bg-[#FFDAD6] text-[#D70015] text-[12px] font-medium transition-colors cursor-pointer"
                          >
                            <EyeOff size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > visibleCount && (
          <div className="p-4 border-t border-black/[0.05] flex justify-center bg-[#FAFAFC]">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 60)}
              className="px-5 py-2 rounded-full bg-white border border-black/[0.08] hover:border-[#0071E3] text-[12px] font-medium text-[#1D1D1F] hover:text-[#0071E3] transition-colors cursor-pointer"
            >
              Daha Fazla Göster ({filtered.length - visibleCount} ürün daha)
            </button>
          </div>
        )}
      </div>

      {/* Toplu Indirim Onay Modali */}
      {discountConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-black/[0.06] p-6 space-y-4">
            <div className="w-11 h-11 rounded-full bg-[#E8F3FF] text-[#0071E3] flex items-center justify-center mx-auto">
              <Percent size={20} />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
                Toplu İndirim Onayı
              </h3>
              <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                <span className="font-semibold text-[#1D1D1F]">
                  {categories.find((c) => String(c.id) === String(discountCatId))?.name ||
                    "Seçili kategori"}
                </span>{" "}
                kategorisindeki tüm aktif ürünlerin fiyatına{" "}
                <span className="font-semibold text-[#0071E3]">%{discountRate}</span> indirim
                uygulanacak ve her değişiklik denetim günlüğüne kaydedilecektir.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDiscountConfirmOpen(false)}
                disabled={applyingDiscount}
                className="py-2.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[13px] font-medium transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={executeBulkDiscount}
                disabled={applyingDiscount}
                className="py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-60"
              >
                {applyingDiscount ? "Uygulanıyor..." : "Onayla ve Uygula"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Urun Ekleme Modali */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateProduct}
            className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-black/[0.06] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Yeni Ürün Ekle</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-full bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Örn: Apple Magic Mouse Siyah"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                    Ürün Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdCode}
                    onChange={(e) => setNewProdCode(e.target.value)}
                    placeholder="PRD-APL-MM1"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                    Kategori *
                  </label>
                  <select
                    value={newProdCatId}
                    onChange={(e) => setNewProdCatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                    Baz Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="3499"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                    Başlangıç Stoğu *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Kısa ürün açıklaması"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="py-2.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[13px] font-medium cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={creatingProduct}
                className="py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-medium cursor-pointer disabled:opacity-60"
              >
                {creatingProduct ? "Ekleniyor..." : "Ürünü Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
