"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { XCircle, Plus, CheckCircle2, AlertCircle, Search, Lock, ArrowRight, RotateCcw } from "lucide-react";

function formatTL(val) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(val || 0));
}

const STATUS_TABS = [
  { key: "ALL", label: "Tümü" },
  { key: "PENDING", label: "Beklemede" },
  { key: "PROCESSING", label: "Hazırlanıyor" },
  { key: "SHIPPED", label: "Kargoda" },
  { key: "DELIVERED", label: "Teslim Edildi" },
  { key: "CANCELLED", label: "İptal" },
];

const STATUS_STYLE = {
  DELIVERED: { label: "Teslim Edildi", cls: "bg-[#EAF8EE] text-[#248A3D]" },
  SHIPPED: { label: "Kargoda", cls: "bg-[#E8F3FF] text-[#0071E3]" },
  PROCESSING: { label: "Hazırlanıyor", cls: "bg-[#FFF4E5] text-[#B25000]" },
  PENDING: { label: "Beklemede", cls: "bg-[#F2F2F7] text-[#6E6E73]" },
  CANCELLED: { label: "İptal Edildi", cls: "bg-[#FFEBE9] text-[#D70015]" },
};

const NEXT_ACTION_LABEL = {
  PENDING: "Hazırla",
  PROCESSING: "Kargoya Ver",
  SHIPPED: "Teslim Et",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  async function fetchOrders(statusFilter = filter) {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?status=${statusFilter}`);
      const json = await res.json();
      setOrders(json.orders || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  async function executeCancel() {
    if (!confirmTarget) return;
    setCancelling(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/orders/${confirmTarget.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Yönetim paneli iptal talebi" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error });
      } else {
        setFeedback({
          type: "success",
          text: `${confirmTarget.order_code}: ${data.message}`,
        });
        await fetchOrders(filter);
      }
    } finally {
      setCancelling(false);
      setConfirmTarget(null);
    }
  }

  async function handleAdvanceStatus(orderId) {
    setFeedback(null);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
    });
    const data = await res.json();

    if (!res.ok) {
      setFeedback({ type: "error", text: data.error });
    } else {
      setFeedback({ type: "success", text: data.message });
      await fetchOrders(filter);
    }
  }

  async function handleReturnShipment(orderId) {
    setFeedback(null);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentStatus: "RETURNED" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error });
    } else {
      setFeedback({ type: "success", text: data.message });
      await fetchOrders(filter);
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.order_code || "").toLowerCase().includes(q) ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.customer_email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Apple Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#6E6E73] mb-1">
            Sipariş Kayıtları · sp_cancel_order
          </p>
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1D1D1F] leading-tight">
            Sipariş Yönetimi
          </h1>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          Mağazadan Yeni Sipariş
        </Link>
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

      {/* Segmented Control & Arama */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 bg-[#E8E8ED] p-1 rounded-full self-start">
          {STATUS_TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
          />
          <input
            type="text"
            placeholder="Sipariş kodu veya müşteri ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-black/[0.08] text-[13px] text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition-all"
          />
        </div>
      </div>

      {/* Siparis Tablosu */}
      <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFAFC] text-[#86868B] text-[11px] uppercase tracking-wider">
                <th className="px-5 py-3.5 font-medium">Sipariş Kodu</th>
                <th className="px-5 py-3.5 font-medium">Müşteri</th>
                <th className="px-5 py-3.5 font-medium">Tarih</th>
                <th className="px-5 py-3.5 font-medium">Ödeme</th>
                <th className="px-5 py-3.5 font-medium">Kargo Takip</th>
                <th className="px-5 py-3.5 font-medium">Durum</th>
                <th className="px-5 py-3.5 font-medium text-right">Toplam</th>
                <th className="px-5 py-3.5 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-[#86868B]">
                    Siparişler yükleniyor...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-[#86868B]">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const canCancel = o.status === "PENDING" || o.status === "PROCESSING";
                  const st = STATUS_STYLE[o.status] || {
                    label: o.status,
                    cls: "bg-[#F2F2F7] text-[#6E6E73]",
                  };

                  return (
                    <tr key={o.id} className="hover:bg-[#FAFAFC] transition-colors">
                      <td className="px-5 py-4 font-mono text-[12px] font-medium text-[#1D1D1F]">
                        {o.order_code}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#1D1D1F]">{o.customer_name}</div>
                        <div className="text-[11px] text-[#86868B]">{o.customer_email}</div>
                      </td>
                      <td className="px-5 py-4 text-[#6E6E73] tabular-nums">
                        {new Date(o.created_at).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#6E6E73]">
                        <span className="font-medium text-[#1D1D1F]">
                          {o.payment_method || "-"}
                        </span>{" "}
                        · {o.payment_status || "-"}
                      </td>
                      <td className="px-5 py-4 text-[11px] text-[#6E6E73]">
                        {o.tracking_number ? (
                          <div>
                            <div className="font-mono font-medium text-[#1D1D1F]">
                              {o.tracking_number}
                            </div>
                            <div className="text-[#86868B]">
                              {o.carrier} · {o.shipment_status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#86868B]">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums font-semibold text-[#1D1D1F]">
                        {formatTL(o.total_amount)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {NEXT_ACTION_LABEL[o.status] && (
                            <button
                              onClick={() => handleAdvanceStatus(o.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E8F3FF] text-[#0071E3] hover:bg-[#D6E9FF] text-[12px] font-medium transition-colors cursor-pointer"
                            >
                              <span>{NEXT_ACTION_LABEL[o.status]}</span>
                              <ArrowRight size={12} />
                            </button>
                          )}

                          {o.status === "DELIVERED" && o.shipment_status !== "RETURNED" && (
                            <button
                              onClick={() => handleReturnShipment(o.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFF4E5] text-[#B25000] hover:bg-[#FFE8C7] text-[12px] font-medium transition-colors cursor-pointer"
                            >
                              <RotateCcw size={12} />
                              İade Et
                            </button>
                          )}

                          {canCancel ? (
                            <button
                              onClick={() => setConfirmTarget(o)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFEBE9] text-[#D70015] hover:bg-[#FFDAD6] text-[12px] font-medium transition-colors cursor-pointer"
                            >
                              <XCircle size={13} />
                              İptal Et
                            </button>
                          ) : (
                            !NEXT_ACTION_LABEL[o.status] &&
                            !(o.status === "DELIVERED" && o.shipment_status !== "RETURNED") && (
                              <span className="inline-flex items-center gap-1 text-[12px] text-[#86868B]">
                                <Lock size={12} />
                                Kilitli
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apple-style Onay Modali */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-black/[0.06] p-6 space-y-4">
            <div className="w-11 h-11 rounded-full bg-[#FFEBE9] text-[#D70015] flex items-center justify-center mx-auto">
              <XCircle size={22} />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
                Siparişi İptal Et
              </h3>
              <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                <span className="font-mono font-medium text-[#1D1D1F]">
                  {confirmTarget.order_code}
                </span>{" "}
                kodlu sipariş iptal edilecek, ödeme iade durumuna çekilecek ve ürünler stoğa geri
                eklenecektir.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={cancelling}
                className="py-2.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[13px] font-medium transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={executeCancel}
                disabled={cancelling}
                className="py-2.5 rounded-full bg-[#D70015] hover:bg-[#B80012] text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-60"
              >
                {cancelling ? "İptal Ediliyor..." : "Onayla ve İptal Et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
