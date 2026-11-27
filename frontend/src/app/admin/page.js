"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Users,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

function formatTL(val) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));
}

const ORDER_STATUS_STYLE = {
  DELIVERED: { label: "Teslim Edildi", cls: "bg-[#EAF8EE] text-[#248A3D]" },
  SHIPPED: { label: "Kargoda", cls: "bg-[#E8F3FF] text-[#0071E3]" },
  PROCESSING: { label: "Hazırlanıyor", cls: "bg-[#FFF4E5] text-[#B25000]" },
  PENDING: { label: "Beklemede", cls: "bg-[#F2F2F7] text-[#6E6E73]" },
  CANCELLED: { label: "İptal Edildi", cls: "bg-[#FFEBE9] text-[#D70015]" },
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(null);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
      if (json?.monthlySales?.length > 0) {
        setActiveMonth(json.monthlySales[json.monthlySales.length - 1]);
      }
    } catch (err) {
      console.error("Dashboard yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-4 w-40 bg-black/[0.06] rounded-full"></div>
            <div className="h-9 w-64 bg-black/[0.08] rounded-xl"></div>
          </div>
          <div className="h-9 w-40 bg-black/[0.06] rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 bg-white rounded-[20px] border border-black/[0.05]"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 h-80 bg-white rounded-[20px] border border-black/[0.05]"></div>
          <div className="lg:col-span-5 h-80 bg-white rounded-[20px] border border-black/[0.05]"></div>
        </div>
      </div>
    );
  }

  const { kpis, monthlySales, criticalInventory, topCustomers, recentOrders } = data;
  const maxRevenue = Math.max(...monthlySales.map((m) => Number(m.monthly_revenue)), 1);
  const displayMonth = activeMonth || monthlySales[monthlySales.length - 1] || null;

  return (
    <div className="space-y-8">
      {/* Apple Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#6E6E73] mb-1">
            Analitik Motor · Canlı PostgreSQL Görünümleri
          </p>
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1D1D1F] leading-tight">
            Yönetim Özeti
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-[#FAFAFC] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
          >
            <RefreshCw size={14} className="text-[#6E6E73]" />
            Yenile
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all"
          >
            Mağazada Test Et
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Bento KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-[#6E6E73]">Net Toplam Ciro</span>
            <span className="w-8 h-8 rounded-full bg-[#EAF8EE] text-[#248A3D] flex items-center justify-center">
              <TrendingUp size={16} />
            </span>
          </div>
          <div>
            <div className="text-[28px] font-semibold tracking-[-0.02em] text-[#1D1D1F] tabular-nums">
              {formatTL(kpis.total_revenue)}
            </div>
            <p className="text-[12px] text-[#86868B] mt-1">İptaller hariç gerçekleşen satış</p>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-[#6E6E73]">Sipariş Hacmi</span>
            <span className="w-8 h-8 rounded-full bg-[#E8F3FF] text-[#0071E3] flex items-center justify-center">
              <ShoppingBag size={16} />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-semibold tracking-[-0.02em] text-[#1D1D1F] tabular-nums">
                {kpis.total_orders}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E8F3FF] text-[#0071E3] text-[11px] font-medium tabular-nums">
                {kpis.active_orders} aktif
              </span>
            </div>
            <p className="text-[12px] text-[#86868B] mt-1">sp_create_order kontrolünde</p>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-[#6E6E73]">Kritik Stok</span>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                Number(kpis.critical_stock_count) > 0
                  ? "bg-[#FFEBE9] text-[#D70015]"
                  : "bg-[#EAF8EE] text-[#248A3D]"
              }`}
            >
              <AlertTriangle size={16} />
            </span>
          </div>
          <div>
            <div
              className={`text-[28px] font-semibold tracking-[-0.02em] tabular-nums ${
                Number(kpis.critical_stock_count) > 0 ? "text-[#D70015]" : "text-[#1D1D1F]"
              }`}
            >
              {kpis.critical_stock_count} Ürün
            </div>
            <p className="text-[12px] text-[#86868B] mt-1">vw_inventory_critical_status</p>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-[#6E6E73]">Aktif Müşteri</span>
            <span className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center">
              <Users size={16} />
            </span>
          </div>
          <div>
            <div className="text-[28px] font-semibold tracking-[-0.02em] text-[#1D1D1F] tabular-nums">
              {kpis.customer_count}
            </div>
            <p className="text-[12px] text-[#86868B] mt-1">Türkiye geneli kayıtlı hesaplar</p>
          </div>
        </div>
      </div>

      {/* Orta Bento: Aylik Ciro Grafigi + Kritik Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sol 7 kolon: Aylik Satis Grafigi */}
        <div className="lg:col-span-7 bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-[#1D1D1F]">
                Aylık Ciro & Büyüme
              </h2>
              <p className="text-[12px] text-[#86868B] mt-0.5">
                vw_monthly_sales_analytics · LAG & SUM OVER
              </p>
            </div>

            {displayMonth && (
              <div className="sm:text-right bg-[#F5F5F7] sm:bg-transparent px-3.5 py-2 sm:p-0 rounded-xl">
                <div className="flex sm:justify-end items-center gap-2 text-[12px] text-[#6E6E73]">
                  <span className="font-medium text-[#1D1D1F]">{displayMonth.month}</span>
                  <span>·</span>
                  <span className="tabular-nums">{displayMonth.successful_orders} sipariş</span>
                  {displayMonth.mom_growth_rate !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium tabular-nums ${
                        Number(displayMonth.mom_growth_rate) >= 0
                          ? "bg-[#EAF8EE] text-[#248A3D]"
                          : "bg-[#FFEBE9] text-[#D70015]"
                      }`}
                    >
                      {Number(displayMonth.mom_growth_rate) >= 0 ? "+" : ""}
                      {displayMonth.mom_growth_rate}%
                    </span>
                  )}
                </div>
                <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F] tabular-nums mt-0.5">
                  {formatTL(displayMonth.monthly_revenue)}
                </div>
              </div>
            )}
          </div>

          {/* Apple Health-style Bar Chart */}
          <div className="h-56 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-black/[0.06]">
            {monthlySales.map((m) => {
              const rev = Number(m.monthly_revenue);
              const heightPct = Math.max(8, Math.round((rev / maxRevenue) * 100));
              const isSelected = displayMonth?.month === m.month;

              return (
                <div
                  key={m.month}
                  onMouseEnter={() => setActiveMonth(m)}
                  className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[34px] rounded-t-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-[#0071E3] shadow-[0_4px_12px_rgba(0,113,227,0.28)]"
                        : "bg-[#E5E5EA] group-hover:bg-[#0071E3]/70"
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between gap-2 sm:gap-3 pt-2.5">
            {monthlySales.map((m) => {
              const isSelected = displayMonth?.month === m.month;
              return (
                <div
                  key={m.month}
                  className={`flex-1 text-center text-[11px] tabular-nums truncate transition-colors ${
                    isSelected ? "font-semibold text-[#1D1D1F]" : "text-[#86868B]"
                  }`}
                >
                  {m.month.slice(2)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sag 5 kolon: Kritik Stok Bildirimleri */}
        <div className="lg:col-span-5 bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-[#1D1D1F]">
                Kritik Stok Bildirimleri
              </h2>
              <p className="text-[12px] text-[#86868B] mt-0.5">
                Eşik değerinin altına inen ürünler
              </p>
            </div>
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[#0071E3] hover:underline"
            >
              Yönet
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-black/[0.05] flex-1">
            {criticalInventory.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#86868B]">
                Tüm ürünlerin stok seviyeleri güvenli aralıkta.
              </div>
            ) : (
              criticalInventory.map((item) => (
                <div
                  key={item.product_id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#1D1D1F] truncate">
                      {item.product_name}
                    </div>
                    <div className="text-[11px] font-mono text-[#86868B] mt-0.5">
                      {item.product_code} · Eşik: {item.reorder_threshold}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2.5">
                    <span className="text-[13px] font-semibold text-[#1D1D1F] tabular-nums">
                      {item.stock_quantity} ad.
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        item.urgency_level === "CRITICAL"
                          ? "bg-[#FFEBE9] text-[#D70015]"
                          : "bg-[#FFF4E5] text-[#B25000]"
                      }`}
                    >
                      {item.urgency_level === "CRITICAL" ? "Kritik" : "Düşük"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alt Bento: En Iyi Musteriler & Son Siparisler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* En Yuksek LTV Musteriler */}
        <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
          <div className="mb-4">
            <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-[#1D1D1F]">
              En Değerli Müşteriler
            </h2>
            <p className="text-[12px] text-[#86868B] mt-0.5">
              Kaynak: vw_customer_summary
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-black/[0.06] text-[#86868B] text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-medium">Müşteri</th>
                  <th className="pb-3 font-medium text-right">Sipariş</th>
                  <th className="pb-3 font-medium text-right">İptal</th>
                  <th className="pb-3 font-medium text-right">Toplam Harcama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {topCustomers.map((c) => {
                  const initials = (c.full_name || "M")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <tr key={c.user_id} className="hover:bg-[#FAFAFC] transition-colors">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[11px] font-semibold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#1D1D1F] truncate">{c.full_name}</div>
                            <div className="text-[11px] text-[#86868B] truncate">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right tabular-nums text-[#1D1D1F]">
                        {c.total_orders}
                      </td>
                      <td className="py-3 text-right tabular-nums text-[#86868B]">
                        %{c.cancellation_rate || 0}
                      </td>
                      <td className="py-3 text-right tabular-nums font-semibold text-[#248A3D]">
                        {formatTL(c.total_spent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Son Siparisler */}
        <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-[#1D1D1F]">
                Son Sipariş Hareketleri
              </h2>
              <p className="text-[12px] text-[#86868B] mt-0.5">
                Son gerçekleşen işlemler
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[#0071E3] hover:underline"
            >
              Tümü
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-black/[0.06] text-[#86868B] text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-medium">Kod</th>
                  <th className="pb-3 font-medium">Müşteri</th>
                  <th className="pb-3 font-medium">Durum</th>
                  <th className="pb-3 font-medium text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {recentOrders.map((o) => {
                  const st = ORDER_STATUS_STYLE[o.status] || {
                    label: o.status,
                    cls: "bg-[#F2F2F7] text-[#6E6E73]",
                  };
                  return (
                    <tr key={o.id} className="hover:bg-[#FAFAFC] transition-colors">
                      <td className="py-3 pr-2 font-mono text-[12px] font-medium text-[#1D1D1F]">
                        {o.order_code}
                      </td>
                      <td className="py-3 pr-2 text-[#1D1D1F]">{o.full_name}</td>
                      <td className="py-3 pr-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 text-right tabular-nums font-semibold text-[#1D1D1F]">
                        {formatTL(o.total_amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
