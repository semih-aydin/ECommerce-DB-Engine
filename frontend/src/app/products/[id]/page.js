"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import AydinStoreLogo from "@/components/AydinStoreLogo";
import { getProductImage, extractBrand } from "@/lib/productImages";
import { useCart } from "@/context/CartContext";

function formatTL(val) {
  return (
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(val || 0)) + " TL"
  );
}

function ProductDetailContent() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);
  const { cart, addToCart, totalCartItems, setCartOpen } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
        }
      } finally {
        setLoading(false);
      }
    }
    if (params?.id) loadProduct();
  }, [params?.id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, qty);
    setQty(1);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-8 flex items-center justify-center text-sm text-[#6E6E73]">
        Ürün bilgileri yükleniyor...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-8 flex flex-col items-center justify-center gap-4">
        <div className="text-lg font-semibold text-[#1D1D1F]">Ürün bulunamadı.</div>
        <Link href="/" className="text-sm font-medium text-[#0071E3] hover:underline">
          ← Mağazaya Dön
        </Link>
      </div>
    );
  }

  const imgUrl = product.image_url || getProductImage(product.name, product.category_name);
  const { brand, title } = extractBrand(product.name);
  const outOfStock = product.stock_quantity === 0;
  const lowStock =
    product.stock_quantity > 0 && product.stock_quantity <= product.reorder_threshold;
  const inCartQty = cart.find((i) => i.product_id === product.id)?.quantity || 0;
  const remainingAddable = Math.max(0, product.stock_quantity - inCartQty);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col">
      {/* Frosted Header */}
      <header className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.08] sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <AydinStoreLogo />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-[#1D1D1F] transition-colors"
            >
              <ArrowLeft size={14} />
              Mağazaya Dön
            </Link>
            <Link
              href="/"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition-colors"
            >
              <ShoppingCart size={15} />
              <span>Sepetim</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white text-[#0071E3] font-semibold text-[11px] leading-none tabular-nums">
                {totalCartItems}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6E6E73]">
          <Link href="/" className="hover:text-[#0071E3] transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <span>{product.category_name}</span>
          <span>/</span>
          <span className="text-[#1D1D1F] font-medium truncate">{product.name}</span>
        </div>

        {/* Urun Detay Karti */}
        <div className="bg-white border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.03)] rounded-[24px] p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sol: Buyuk Studyo Gorseli */}
          <div className="lg:col-span-5 bg-[#FAFAFC] border border-black/[0.05] rounded-[20px] p-8 flex items-center justify-center min-h-[360px]">
            <img
              src={imgUrl}
              alt={product.name}
              className="max-h-80 max-w-full object-contain"
            />
          </div>

          {/* Sag: Detaylar, Stok Bilgisi ve Sepet */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0071E3]">
                  {brand} · {product.category_name}
                </span>
                <span className="text-xs font-mono text-[#86868B]">
                  Kod: {product.product_code}
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em] text-[#1D1D1F] leading-snug">
                {brand} {title}
              </h1>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-[#FF9F0A]">
                  <Star size={14} fill="currentColor" />
                  <span className="font-semibold text-[#1D1D1F]">4.8</span>
                </div>
                <span className="text-[#D2D2D7]">|</span>
                <span className="text-[#6E6E73]">128 Değerlendirme</span>
              </div>

              {/* Fiyat */}
              <div className="pt-2 pb-4 border-b border-black/[0.06]">
                <div className="text-3xl font-semibold tracking-[-0.02em] text-[#1D1D1F] tabular-nums">
                  {formatTL(product.base_price)}
                </div>
                <div className="text-xs text-[#86868B] mt-1">
                  %{Number(product.tax_rate)} KDV Dahil
                </div>
              </div>

              {/* Stok Durumu Kutusu */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  outOfStock
                    ? "bg-[#FFEBE9] border-[#FF3B30]/25 text-[#D70015]"
                    : lowStock
                    ? "bg-[#FFF4E5] border-[#FF9F0A]/30 text-[#B25000]"
                    : "bg-[#EAF8EE] border-[#34C759]/25 text-[#248A3D]"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {outOfStock || lowStock ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <PackageCheck size={16} />
                  )}
                  <span>
                    {outOfStock
                      ? "Bu ürün geçici olarak tükenmiştir."
                      : lowStock
                      ? `Acele edin! Depoda son ${product.stock_quantity} adet kaldı.`
                      : "Ürün stokta mevcut ve gönderime hazır."}
                  </span>
                </div>
                <span className="font-mono font-semibold tabular-nums">
                  Stok: {product.stock_quantity} Adet
                </span>
              </div>

              {/* Aciklama */}
              <div className="space-y-1.5 pt-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                  Ürün Özellikleri
                </h2>
                <p className="text-sm text-[#1D1D1F]/85 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Adet ve Sepete Ekle */}
            <div className="space-y-4 pt-4 border-t border-black/[0.06]">
              {addedMsg && (
                <div className="p-3.5 rounded-2xl bg-[#EAF8EE] border border-[#34C759]/25 text-[#248A3D] text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={16} />
                    Ürün sepete eklendi!
                  </span>
                  <Link href="/" onClick={() => setCartOpen(true)} className="font-semibold underline">
                    Sepeti Aç →
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-black/[0.1] rounded-full bg-[#F5F5F7] px-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-[#1D1D1F] hover:text-[#0071E3] cursor-pointer transition-colors"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center font-semibold text-sm tabular-nums">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(remainingAddable || 1, q + 1))}
                    disabled={outOfStock || qty >= remainingAddable}
                    className="p-2.5 text-[#1D1D1F] hover:text-[#0071E3] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock || remainingAddable === 0}
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#0071E3] hover:bg-[#0077ED] disabled:bg-[#E8E8ED] disabled:text-[#86868B] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                >
                  <ShoppingCart size={18} />
                  {outOfStock
                    ? "Stokta Yok"
                    : remainingAddable === 0
                    ? "Maksimum Stok Sepette"
                    : "Sepete Ekle"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] text-[#6E6E73]">
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-[#0071E3]" />
                  <span>500 TL+ Ücretsiz Kargo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#0071E3]" />
                  <span>2 Yıl Garanti</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={14} className="text-[#0071E3]" />
                  <span>14 Gün İade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5F7] p-8 flex items-center justify-center text-sm text-[#6E6E73]">
          Ürün yükleniyor...
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
