"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  User,
  Truck,
  ShieldCheck,
  Award,
  RotateCcw,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Star,
  ChevronRight,
  SlidersHorizontal,
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

export default function AydinStorePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(60);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [simulateFail, setSimulateFail] = useState(false);

  const {
    cart,
    cartOpen,
    setCartOpen,
    addToCart: contextAddToCart,
    updateQty,
    clearCart,
    syncCartProducts,
    totalCartItems,
  } = useCart();

  const [summary, setSummary] = useState({
    subtotal: 0,
    tax_total: 0,
    shipping_fee: 0,
    total_amount: 0,
    free_shipping_qualified: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderNotice, setOrderNotice] = useState(null);

  async function loadStoreData() {
    try {
      const [pRes, uRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/users"),
      ]);
      const pJson = await pRes.json();
      const uJson = await uRes.json();

      setProducts(pJson.products || []);
      syncCartProducts(pJson.products || []);
      const subCats = (pJson.categories || []).filter((c) => c.parent_id !== null);
      setCategories(subCats);

      const userList = uJson.users || [];
      setUsers(userList);
      if (userList.length > 0 && !selectedUserId) {
        const alperen = userList.find((u) =>
          u.full_name.toLowerCase().includes("alperen yurt")
        );
        const defaultUser = alperen || userList[0];
        setSelectedUserId(String(defaultUser.id));
        setShippingAddress(defaultUser.address || "Ortahisar, Trabzon");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStoreData();
  }, []);

  // Canli sepet hesabi (PostgreSQL fn_calculate_cart_total)
  useEffect(() => {
    async function calcCart() {
      if (cart.length === 0) {
        setSummary({
          subtotal: 0,
          tax_total: 0,
          shipping_fee: 0,
          total_amount: 0,
          free_shipping_qualified: false,
        });
        return;
      }

      const payload = cart.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));

      const res = await fetch("/api/orders/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      if (res.ok) {
        setSummary(await res.json());
      }
    }
    calcCart();
  }, [cart]);

  function addToCart(product) {
    setOrderNotice(null);
    contextAddToCart(product, 1);
  }

  async function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    setOrderNotice(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(selectedUserId),
          items: cart.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
          paymentMethod,
          shippingAddress,
          simulateFail,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOrderNotice({ type: "error", text: data.error });
      } else {
        setOrderNotice({ type: "success", text: data.message });
        clearCart();
        await loadStoreData();
      }
    } catch (err) {
      setOrderNotice({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const brandCounts = products.reduce((acc, p) => {
    const { brand } = extractBrand(p.name);
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});
  const availableBrands = Object.keys(brandCounts).sort();

  function toggleBrand(brand) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  function clearFilters() {
    setSelectedCategory("ALL");
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setOnlyInStock(false);
    setSearch("");
  }

  let visibleProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === "ALL" || String(p.category_id) === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.product_code.toLowerCase().includes(search.toLowerCase());
    const { brand } = extractBrand(p.name);
    const matchBrand =
      selectedBrands.length === 0 || selectedBrands.includes(brand);
    const price = Number(p.base_price);
    const matchMin = minPrice === "" || price >= Number(minPrice);
    const matchMax = maxPrice === "" || price <= Number(maxPrice);
    const matchStock = !onlyInStock || p.stock_quantity > 0;
    return matchCat && matchSearch && matchBrand && matchMin && matchMax && matchStock;
  });

  const hasActiveFilters =
    selectedCategory !== "ALL" ||
    selectedBrands.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    onlyInStock ||
    search !== "";

  if (sortBy === "PRICE_ASC") {
    visibleProducts = [...visibleProducts].sort(
      (a, b) => Number(a.base_price) - Number(b.base_price)
    );
  } else if (sortBy === "PRICE_DESC") {
    visibleProducts = [...visibleProducts].sort(
      (a, b) => Number(b.base_price) - Number(a.base_price)
    );
  }

  const remainingForFreeShipping = Math.max(0, 500 - Number(summary.subtotal || 0));

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
      {/* 1. Ust Bilgi Seridi */}
      <div className="bg-[#1D1D1F] text-white/90 text-[11px] py-1.5 px-4">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            500 TL ve üzeri alışverişlerinizde <strong className="text-white">Kargo Bedava</strong>
          </span>
          <div className="flex items-center gap-4 text-white/65">
            <span>Aynı Gün Kargo</span>
            <span>·</span>
            <span>2 Yıl Garanti</span>
            <span>·</span>
            <span>Güvenli Ödeme</span>
          </div>
        </div>
      </div>

      {/* 2. Ana Magaza Header (Apple Frosted Glass) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.08]">
        <div className="max-w-[1360px] mx-auto px-4 lg:px-8 h-18 flex items-center justify-between gap-6">
          <Link href="/" className="shrink-0">
            <AydinStoreLogo />
          </Link>

          {/* Arama Kutusu */}
          <div className="flex-1 max-w-xl hidden md:flex items-center relative">
            <Search
              size={15}
              className="absolute left-4 text-[#86868B] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Aradığınız ürün, marka veya model kodunu yazın..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 text-[13px] text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none transition-all"
            />
          </div>

          {/* Sag Aksiyonlar: Hesabim, Yonetim, Sepetim */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/[0.08] bg-white hover:border-black/[0.15] transition-colors">
              <User size={14} className="text-[#6E6E73] shrink-0" />
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  const u = users.find((usr) => String(usr.id) === e.target.value);
                  if (u) setShippingAddress(u.address || "");
                }}
                className="text-xs font-medium text-[#1D1D1F] bg-transparent focus:outline-none max-w-[140px] cursor-pointer"
                title="Aktif müşteri hesabı"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] hover:bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] bg-white transition-colors"
            >
              <LayoutDashboard size={14} className="text-[#6E6E73]" />
              <span className="hidden lg:inline">Yönetim Paneli</span>
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition-colors cursor-pointer shadow-[0_1px_3px_rgba(0,113,227,0.3)]"
            >
              <ShoppingCart size={15} />
              <span>Sepetim</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white text-[#0071E3] font-semibold text-[11px] leading-none tabular-nums">
                {totalCartItems}
              </span>
            </button>
          </div>
        </div>

        {/* 3. Mobil Arama + Yatay Kategori Sekmeleri */}
        <div className="md:hidden px-4 pb-2.5">
          <div className="relative flex items-center">
            <Search
              size={15}
              className="absolute left-3.5 text-[#86868B] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Ürün, marka veya model kodu ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] text-[13px] text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none transition-all"
            />
          </div>
        </div>
        <div className="border-t border-black/[0.05] bg-white/60">
          <div className="max-w-[1360px] mx-auto px-4 lg:px-8 flex items-center gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                selectedCategory === "ALL"
                  ? "border-[#0071E3] text-[#0071E3]"
                  : "border-transparent text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              Tüm Ürünler
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  selectedCategory === String(cat.id)
                    ? "border-[#0071E3] text-[#0071E3]"
                    : "border-transparent text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 4. Ana Vitrin Govdesi */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Apple Space Black Kampanya Banner'i */}
        <section className="rounded-[24px] bg-gradient-to-br from-[#1D1D1F] via-[#2C2C2E] to-[#1D1D1F] text-white p-7 lg:p-11 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="space-y-3.5 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-[#0071E3] text-white text-[11px] font-medium tracking-wide">
              AydınStore Teknoloji Günleri
            </span>
            <h1 className="text-2xl lg:text-4xl font-semibold tracking-[-0.025em] leading-tight">
              Yeni Nesil Teknoloji ve Donanım Ürünleri
            </h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Dizüstü bilgisayarlar, akıllı telefonlar, kulaklıklar ve akıllı saatlerde
              500 TL üzeri ücretsiz ve aynı gün kargo fırsatı.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                Ürünleri Keşfet
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Vitrin Gorselleri */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-[20px] bg-white p-3.5 shadow-xl flex items-center justify-center">
              <img
                src="/images/products/laptop-macbook.webp"
                alt="MacBook Pro"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[20px] bg-white p-3.5 shadow-xl flex items-center justify-center">
              <img
                src="/images/products/phone-iphone.webp"
                alt="iPhone 15 Pro"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="hidden sm:flex w-32 h-32 lg:w-36 lg:h-36 rounded-[20px] bg-white p-3.5 shadow-xl items-center justify-center">
              <img
                src="/images/products/audio-airpods-max.webp"
                alt="Kulaklık"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </section>

        {/* Guven Seridi */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: "Aynı Gün Kargo", desc: "16:00'a kadar verilen siparişlerde" },
            { icon: Award, title: "2 Yıl Garanti", desc: "Tüm ürünlerde faturalı garanti" },
            { icon: ShieldCheck, title: "Güvenli Ödeme", desc: "Kart, Cüzdan ve Kupon ile ödeme" },
            { icon: RotateCcw, title: "14 Gün İade", desc: "Koşulsuz kolay değişim ve iade" },
          ].map((b) => {
            const BIcon = b.icon;
            return (
              <div
                key={b.title}
                className="bg-white border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-[18px] px-4 py-3.5 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-[#E8F3FF] text-[#0071E3] flex items-center justify-center shrink-0">
                  <BIcon size={17} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1D1D1F]">{b.title}</div>
                  <div className="text-[11px] text-[#6E6E73]">{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Siralama ve Sonuc Sayisi Bari */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen((v) => !v)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-medium text-[#1D1D1F]"
            >
              <SlidersHorizontal size={14} />
              Filtrele
            </button>
            <div className="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
              Ürünler{" "}
              <span className="text-xs font-normal text-[#6E6E73] tabular-nums">
                ({visibleProducts.length} sonuç)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#0071E3] hover:underline cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6E6E73]">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-medium text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
              >
                <option value="DEFAULT">Önerilen Sıralama</option>
                <option value="PRICE_ASC">En Düşük Fiyat</option>
                <option value="PRICE_DESC">En Yüksek Fiyat</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Sol Filtre Paneli + Sag Urun Vitrini */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sol Filtre Sidebar */}
          <aside
            className={`lg:col-span-3 bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[20px] p-5 space-y-5 lg:sticky lg:top-32 ${
              mobileFilterOpen ? "block" : "hidden lg:block"
            }`}
          >
            {/* Stok Durumu */}
            <div className="pb-4 border-b border-black/[0.06]">
              <div className="text-xs font-semibold text-[#1D1D1F] mb-2.5">
                Stok Durumu
              </div>
              <label className="flex items-center gap-2 text-xs text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="accent-[#0071E3] w-3.5 h-3.5"
                />
                Sadece Stokta Olanlar
              </label>
            </div>

            {/* Fiyat Araligi */}
            <div className="pb-4 border-b border-black/[0.06] space-y-2.5">
              <div className="text-xs font-semibold text-[#1D1D1F]">
                Fiyat Aralığı (TL)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="En Az"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] text-xs focus:outline-none"
                />
                <span className="text-[#86868B] text-xs">-</span>
                <input
                  type="number"
                  placeholder="En Çok"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] text-xs focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: "0 - 5.000", min: "0", max: "5000" },
                  { label: "5.000 - 25.000", min: "5000", max: "25000" },
                  { label: "25.000 - 60.000", min: "25000", max: "60000" },
                  { label: "60.000+", min: "60000", max: "" },
                ].map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => {
                      setMinPrice(range.min);
                      setMaxPrice(range.max);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium border cursor-pointer transition-colors ${
                      minPrice === range.min && maxPrice === range.max
                        ? "bg-[#E8F3FF] border-[#0071E3] text-[#0071E3]"
                        : "bg-[#F5F5F7] border-transparent text-[#6E6E73] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {range.label} TL
                  </button>
                ))}
              </div>
            </div>

            {/* Marka Filtresi */}
            <div>
              <div className="text-xs font-semibold text-[#1D1D1F] mb-2.5">
                Markalar
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center justify-between text-xs text-[#6E6E73] cursor-pointer hover:text-[#1D1D1F]"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="accent-[#0071E3] w-3.5 h-3.5"
                      />
                      <span>{brand}</span>
                    </span>
                    <span className="text-[11px] text-[#86868B] tabular-nums">
                      ({brandCounts[brand]})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Sag Urun Vitrini */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-[20px] bg-white border border-black/[0.05] animate-pulse"
                  />
                ))}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="bg-white border border-black/[0.06] rounded-[20px] p-12 text-center space-y-3">
                <div className="text-sm font-semibold text-[#1D1D1F]">
                  Seçtiğiniz filtrelere uygun ürün bulunamadı.
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-full bg-[#0071E3] text-white text-xs font-medium cursor-pointer"
                >
                  Tüm Filtreleri Temizle
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleProducts.slice(0, visibleCount).map((p) => {
                  const imgUrl = p.image_url || getProductImage(p.name, p.category_name);
                  const { brand, title } = extractBrand(p.name);
                  const outOfStock = p.stock_quantity === 0;
                  const lowStock = p.stock_quantity > 0 && p.stock_quantity <= p.reorder_threshold;
                  const inCartItem = cart.find((c) => c.product_id === p.id);

                  return (
                    <div
                      key={p.id}
                      className="group bg-white border border-black/[0.06] hover:border-[#0071E3]/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] rounded-[20px] flex flex-col justify-between transition-all duration-200 overflow-hidden"
                    >
                      <div>
                        {/* Urun Fotograf Alani */}
                        <Link
                          href={`/products/${p.id}`}
                          className="relative h-48 bg-[#FAFAFC] p-4 flex items-center justify-center border-b border-black/[0.04]"
                        >
                          <img
                            src={imgUrl}
                            alt={p.name}
                            className="max-h-36 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />

                          {(outOfStock || lowStock) && (
                            <div className="absolute top-3 left-3">
                              {outOfStock ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#FFEBE9] text-[#D70015] text-[10px] font-semibold">
                                  Tükendi
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF4E5] text-[#B25000] text-[10px] font-semibold">
                                  Son {p.stock_quantity} Ürün
                                </span>
                              )}
                            </div>
                          )}
                        </Link>

                        {/* Urun Detaylari */}
                        <div className="p-4 space-y-1.5">
                          <Link href={`/products/${p.id}`} className="block">
                            <h3 className="text-[13px] leading-snug text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-2 min-h-[36px]">
                              <span className="font-semibold mr-1">{brand}</span>
                              {title}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-1 text-[11px] text-[#FF9F0A]">
                            <Star size={12} fill="currentColor" />
                            <span className="text-[#1D1D1F] font-semibold">4.8</span>
                            <span className="text-[#86868B]">(120+)</span>
                          </div>

                          <div className="pt-1">
                            <div className="text-[16px] font-semibold tracking-tight text-[#1D1D1F] tabular-nums">
                              {formatTL(p.base_price)}
                            </div>
                            <div className="text-[10px] text-[#86868B]">KDV Dahil</div>
                          </div>
                        </div>
                      </div>

                      {/* Sepete Ekle Butonu */}
                      <div className="p-4 pt-0">
                        <button
                          onClick={() => addToCart(p)}
                          disabled={outOfStock || (inCartItem && inCartItem.quantity >= p.stock_quantity)}
                          className={`w-full py-2 rounded-full text-xs font-medium transition-all border ${
                            outOfStock
                              ? "bg-[#F5F5F7] text-[#86868B] border-transparent cursor-not-allowed"
                              : inCartItem && inCartItem.quantity >= p.stock_quantity
                              ? "bg-[#F5F5F7] text-[#6E6E73] border-black/[0.08] cursor-not-allowed"
                              : inCartItem
                              ? "bg-[#1D1D1F] text-white border-[#1D1D1F] cursor-pointer"
                              : "bg-white text-[#0071E3] border-[#0071E3]/40 hover:bg-[#0071E3] hover:text-white hover:border-[#0071E3] cursor-pointer"
                          }`}
                        >
                          {outOfStock
                            ? "Tükendi"
                            : inCartItem && inCartItem.quantity >= p.stock_quantity
                            ? `Maks. Stok (${inCartItem.quantity})`
                            : inCartItem
                            ? `Sepette (${inCartItem.quantity} Adet)`
                            : "Sepete Ekle"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {visibleProducts.length > visibleCount && (
                <div className="pt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + 60)}
                    className="px-6 py-2.5 rounded-full bg-white border border-black/[0.08] hover:border-[#0071E3] text-xs font-medium text-[#1D1D1F] hover:text-[#0071E3] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
                  >
                    Daha Fazla Ürün Göster ({visibleProducts.length - visibleCount} ürün daha)
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/[0.06] mt-12 py-8 px-4">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E6E73]">
          <AydinStoreLogo />
          <p>
            © 2026 AydınStore · BGM213 Veritabanı ve Yönetimi Projesi (Semih Aydın)
          </p>
        </div>
      </footer>

      {/* 6. Sagdan Acilan AydinStore Sepet Cekmecesi */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between p-6 overflow-y-auto shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1D1D1F]">
                    Sepetim ({totalCartItems} Ürün)
                  </h2>
                  <p className="text-[11px] text-[#86868B]">
                    Anlık veritabanı stok ve fiyat kontrolü
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Kargo Bedava Ilerleme Cubugu */}
              {cart.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#F5F5F7] text-xs">
                  {summary.free_shipping_qualified ? (
                    <span className="font-medium text-[#248A3D]">
                      Tebrikler! Siparişinizde Kargo Bedava avantajı aktif.
                    </span>
                  ) : (
                    <span className="text-[#1D1D1F]">
                      Ücretsiz kargo için sepetinize{" "}
                      <strong className="text-[#0071E3]">
                        {formatTL(remainingForFreeShipping)}
                      </strong>{" "}
                      daha ürün ekleyin.
                    </span>
                  )}
                </div>
              )}

              {orderNotice && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                    orderNotice.type === "success"
                      ? "bg-[#EAF8EE] border-[#34C759]/30 text-[#248A3D]"
                      : "bg-[#FFEBE9] border-[#FF3B30]/30 text-[#D70015]"
                  }`}
                >
                  {orderNotice.type === "success" ? (
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#248A3D]" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#D70015]" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {orderNotice.type === "success"
                        ? "Siparişiniz Başarıyla Alındı!"
                        : "Sipariş İşlemi Reddedildi"}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px]">{orderNotice.text}</div>
                  </div>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <ShoppingCart size={36} className="mx-auto text-[#D2D2D7]" />
                  <div className="text-sm font-medium text-[#1D1D1F]">
                    Sepetiniz şu an boş
                  </div>
                  <div className="text-xs text-[#86868B]">
                    AydınStore vitrininden beğendiğiniz ürünleri ekleyebilirsiniz.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-black/[0.05]">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="py-3.5 flex items-center gap-3 text-xs"
                    >
                      <img
                        src={item.image_url || getProductImage(item.name, item.category_name)}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl bg-[#FAFAFC] border border-black/[0.05] p-1 object-contain shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#1D1D1F] truncate">
                          {item.name}
                        </div>
                        <div className="text-[#0071E3] font-semibold mt-0.5 tabular-nums">
                          {formatTL(item.base_price)}
                        </div>
                        <div className="text-[10px] text-[#86868B]">
                          Depo stoğu: {item.stock_quantity} adet
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateQty(item.product_id, -1)}
                          className="p-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product_id, 1)}
                          disabled={item.quantity >= item.stock_quantity}
                          className="p-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => updateQty(item.product_id, -item.quantity)}
                          className="p-1.5 text-[#D70015] hover:bg-[#FFEBE9] rounded-full cursor-pointer ml-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <form
                onSubmit={handleCheckout}
                className="border-t border-black/[0.06] pt-4 space-y-4 mt-4"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      Ödeme Yöntemi
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] text-xs font-medium focus:outline-none"
                    >
                      <option value="CREDIT_CARD">Kredi / Banka Kartı (CREDIT_CARD)</option>
                      <option value="WALLET">AydınStore Cüzdan (WALLET)</option>
                      <option value="COUPON">Hediye Kuponu (COUPON)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      Teslimat Adresi
                    </label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] text-xs focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-[#6E6E73] cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={simulateFail}
                      onChange={(e) => setSimulateFail(e.target.checked)}
                      className="accent-[#D70015] w-3.5 h-3.5"
                    />
                    Başarısız ödeme (FAILED) senaryosu test et
                  </label>
                </div>

                <div className="space-y-1.5 text-xs pt-2 border-t border-black/[0.06]">
                  <div className="flex justify-between text-[#6E6E73]">
                    <span>Ürünler Toplamı</span>
                    <span className="font-medium text-[#1D1D1F] tabular-nums">
                      {formatTL(summary.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6E6E73]">
                    <span>Kargo Ücreti</span>
                    <span className="font-medium tabular-nums">
                      {summary.free_shipping_qualified ? (
                        <span className="text-[#248A3D]">Bedava</span>
                      ) : (
                        formatTL(summary.shipping_fee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-black/[0.06] text-[#1D1D1F]">
                    <span>Ödenecek Tutar</span>
                    <span className="text-[#0071E3] tabular-nums">
                      {formatTL(summary.total_amount)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                >
                  {submitting ? "Sipariş Onaylanıyor..." : "Sepeti Onayla ve Sipariş Ver"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
