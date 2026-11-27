"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ArrowRight } from "lucide-react";

const ACTION_FILTERS = [
  { key: "ALL", label: "Tümü" },
  { key: "PRICE_UPDATE", label: "Fiyat Güncelleme" },
  { key: "ORDER_CANCELLED", label: "Sipariş İptali" },
];

function formatAuditValue(val) {
  if (!val || typeof val !== "object") return String(val ?? "-");
  return Object.entries(val)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/audit");
      const json = await res.json();
      setLogs(json.logs || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    return log.action === filter;
  });

  return (
    <div className="space-y-6">
      {/* Apple Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#6E6E73] mb-1">
            Otomatik Trigger Günlüğü · audit_logs (JSONB)
          </p>
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1D1D1F] leading-tight">
            Denetim Kayıtları
          </h1>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-[#FAFAFC] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className="text-[#6E6E73]" />
          Yenile
        </button>
      </div>

      {/* Segmented Action Filter */}
      <div className="inline-flex flex-wrap items-center gap-1 bg-[#E8E8ED] p-1 rounded-full">
        {ACTION_FILTERS.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
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

      {/* Audit Table */}
      <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFAFC] text-[#86868B] text-[11px] uppercase tracking-wider">
                <th className="px-5 py-3.5 font-medium">Zaman</th>
                <th className="px-5 py-3.5 font-medium">Kayıt</th>
                <th className="px-5 py-3.5 font-medium">Aksiyon</th>
                <th className="px-5 py-3.5 font-medium">Değişiklik (OLD → NEW)</th>
                <th className="px-5 py-3.5 font-medium">Kaynak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-[#86868B]">
                    Denetim kayıtları yükleniyor...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-[#86868B]">
                    Henüz denetim kaydı yok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFAFC] transition-colors">
                    <td className="px-5 py-4 text-[12px] text-[#6E6E73] tabular-nums whitespace-nowrap">
                      {new Date(log.changed_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] font-medium text-[#1D1D1F] whitespace-nowrap">
                      {log.entity_name} #{log.entity_id}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          log.action === "PRICE_UPDATE"
                            ? "bg-[#E8F3FF] text-[#0071E3]"
                            : "bg-[#FFEBE9] text-[#D70015]"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FFEBE9] text-[#D70015]">
                          {formatAuditValue(log.old_value)}
                        </span>
                        <ArrowRight size={13} className="text-[#86868B] shrink-0" />
                        <span className="px-2.5 py-1 rounded-lg bg-[#EAF8EE] text-[#248A3D]">
                          {formatAuditValue(log.new_value)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[12px] font-medium text-[#6E6E73] whitespace-nowrap">
                      {log.changed_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
