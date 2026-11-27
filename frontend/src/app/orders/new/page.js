"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

function formatTL(val) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(val || 0));
}

export default function OrderSimulatorPage() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [shippingAddress, setShippingAddress] = useState("");
  const [search, setSearch] = useState("");

  // Sepet: [{ product_id, name, product_code, base_price, stock_quantity, quantity }]
  const [cart, setCart] = useState([]);
  const [summary, setSummary] = useState({
    subtotal: 0,
    tax_total: 0,
    shipping_fee: 0,
    total_amount: 0,
    free_shipping_qualified: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  async function loadInitialData() {
    const [uRes, pRes] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/products"),
    ]);
    const uJson = await uRes.json();
    const pJson = await pRes.json();

    const userList = uJson.users || [];
    setUsers(userList);
    if (userList.length > 0 && !selectedUserId) {
      setSelectedUserId(String(userList[0].id));
      setShippingAddress(userList[0].address || "Ortahisar, Trabzon");
    }
    setProducts(pJson.products || []);
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  // Sepet her degistiginde PostgreSQL fn_calculate_cart_total fonksiyonunu cagir
  useEffect(() => {
    async function calc() {
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

      const payload = cart.map((c) => ({
        product_id: c.product_id,
        quantity: c.quantity,
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
    calc();
  }, [cart]);

  function addToCart(product) {
    setResultMsg(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          product_code: product.product_code,
          base_price: product.base_price,
          stock_quantity: product.stock_quantity,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(productId, delta) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product_id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    setResultMsg(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(selectedUserId),
          items: cart.map((c) => ({
            product_id: c.product_id,
            quantity: c.quantity,
          })),
          paymentMethod,
          shippingAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResultMsg({ type: "error", text: data.error });
      } else {
        setResultMsg({ type: "success", text: data.message });
        setCart([]);
        // Stoklarin anlik dustugunu gormek icin urunleri yenile
        await loadInitialData();
      }
    } catch (err) {
      setResultMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.product_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent-signal)] mb-1">
          ACID Transaction Test · sp_create_order & FOR UPDATE
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Sipariş Simülatörü</h1>
      </div>

      {resultMsg && (
        <div
          className={`p-4 rounded-md border flex items-start gap-3 text-sm ${
            resultMsg.type === "success"
              ? "bg-[var(--status-ok-dim)] border-[var(--status-ok)]/40 text-[var(--status-ok)]"
              : "bg-[var(--status-err-dim)] border-[var(--status-err)]/40 text-[var(--status-err)]"
          }`}
        >
          {resultMsg.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold">
              {resultMsg.type === "success"
                ? "Transaction Başarılı (COMMIT)"
                : "Veritabanı İşlemi Reddetti (ROLLBACK)"}
            </div>
            <div className="text-xs font-mono mt-0.5">{resultMsg.text}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sol 7 kolon: Urun Secimi */}
        <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">Katalogdan Ürün Ekle</h2>
            <input
              type="text"
              placeholder="Ürün adı veya PRD kodu ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 px-3 py-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent-signal)]"
            />
          </div>

          <div className="max-h-[540px] overflow-y-auto divide-y divide-[var(--border-subtle)] pr-1">
            {filteredProducts.slice(0, 40).map((p) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[var(--ink-primary)] truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--ink-muted)] mt-0.5 flex items-center gap-3">
                    <span>{p.product_code}</span>
                    <span>·</span>
                    <span
                      className={
                        p.stock_quantity <= p.reorder_threshold
                          ? "text-[var(--status-err)]"
                          : "text-[var(--ink-secondary)]"
                      }
                    >
                      Stok: {p.stock_quantity}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-semibold text-[var(--ink-primary)]">
                    {formatTL(p.base_price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    className="px-2.5 py-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--accent-signal)] hover:text-black border border-[var(--border-strong)] text-xs font-medium transition-colors cursor-pointer"
                  >
                    + Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sag 5 kolon: Sepet ve SP Onayi */}
        <form
          onSubmit={handleCreateOrder}
          className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md p-5 space-y-5 sticky top-6"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart size={16} className="text-[var(--accent-signal)]" />
              Aktif Sepet
            </div>
            <span className="text-[11px] font-mono text-[var(--ink-muted)]">
              fn_calculate_cart_total
            </span>
          </div>

          {/* Musteri ve Odeme Bilgisi */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-muted)] mb-1">
                MÜŞTERİ SEÇİMİ
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  const u = users.find((usr) => String(usr.id) === e.target.value);
                  if (u) setShippingAddress(u.address || "");
                }}
                className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent-signal)]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email}) — LTV: {formatTL(u.lifetime_value)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[var(--ink-muted)] mb-1">
                  ÖDEME YÖNTEMİ
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent-signal)]"
                >
                  <option value="CREDIT_CARD">CREDIT_CARD</option>
                  <option value="WALLET">WALLET</option>
                  <option value="COUPON">COUPON</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[var(--ink-muted)] mb-1">
                  TESLİMAT ADRESİ
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent-signal)]"
                />
              </div>
            </div>
          </div>

          {/* Sepet Kalemleri */}
          <div className="space-y-2 max-h-56 overflow-y-auto border-y border-[var(--border-subtle)] py-3">
            {cart.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--ink-muted)]">
                Sepet boş. Soldaki katalogdan ürün ekleyin.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between gap-2 text-xs py-1"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-[10px] font-mono text-[var(--ink-muted)]">
                      Birim: {formatTL(item.base_price)} · Depo: {item.stock_quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, -1)}
                      className="p-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center font-mono font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, 1)}
                      className="p-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, -item.quantity)}
                      className="p-1 text-[var(--status-err)] hover:opacity-80 cursor-pointer ml-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ozet Hesap */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[var(--ink-secondary)]">
              <span>Ara Toplam</span>
              <span className="mono-num">{formatTL(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--ink-muted)]">
              <span>Dahili KDV Tutarı</span>
              <span className="mono-num">{formatTL(summary.tax_total)}</span>
            </div>
            <div className="flex justify-between text-[var(--ink-secondary)]">
              <span>Kargo Ücreti (500 TL üzeri bedava)</span>
              <span className="mono-num">
                {summary.free_shipping_qualified ? (
                  <span className="text-[var(--status-ok)]">ÜCRETSİZ</span>
                ) : (
                  formatTL(summary.shipping_fee)
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-[var(--border-subtle)]">
              <span>Genel Toplam</span>
              <span className="mono-num text-[var(--accent-signal)]">
                {formatTL(summary.total_amount)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={cart.length === 0 || submitting}
            className="w-full py-2.5 rounded-md bg-[var(--accent-signal)] text-black font-semibold text-xs hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
          >
            {submitting
              ? "Transaction Çalışıyor..."
              : "Siparişi Onayla (CALL sp_create_order)"}
          </button>
        </form>
      </div>
    </div>
  );
}
