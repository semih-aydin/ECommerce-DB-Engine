"use client";

import { useEffect, useState } from "react";
import { UserPlus, Search, CheckCircle2, AlertCircle, X } from "lucide-react";

function formatTL(val) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));
}

const USER_STATUS_STYLE = {
  ACTIVE: { label: "Aktif", cls: "bg-[#EAF8EE] text-[#248A3D]" },
  INACTIVE: { label: "Pasif", cls: "bg-[#F2F2F7] text-[#6E6E73]" },
  SUSPENDED: { label: "Engelli", cls: "bg-[#FFEBE9] text-[#D70015]" },
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Ortahisar, Trabzon");
  const [saving, setSaving] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users?all=true");
      const json = await res.json();
      setUsers(json.users || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleStatusChange(userId, nextStatus) {
    setFeedback(null);
    const res = await fetch(`/api/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error });
    } else {
      setFeedback({ type: "success", text: data.message });
      await loadUsers();
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error });
      } else {
        setFeedback({ type: "success", text: data.message });
        setModalOpen(false);
        setFullName("");
        setEmail("");
        setPhone("");
        await loadUsers();
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Apple Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#6E6E73] mb-1">
            Hesap Yönetimi · fn_get_customer_lifetime_value
          </p>
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1D1D1F] leading-tight">
            Kullanıcılar
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={15} />
          Yeni Müşteri Ekle
        </button>
      </div>

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

      {/* Arama */}
      <div className="relative w-full sm:w-80">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
        />
        <input
          type="text"
          placeholder="Ad soyad veya e-posta ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-black/[0.08] text-[13px] text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition-all"
        />
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFAFC] text-[#86868B] text-[11px] uppercase tracking-wider">
                <th className="px-5 py-3.5 font-medium">Müşteri</th>
                <th className="px-5 py-3.5 font-medium">Adres</th>
                <th className="px-5 py-3.5 font-medium">Durum</th>
                <th className="px-5 py-3.5 font-medium text-right">Net Harcama (LTV)</th>
                <th className="px-5 py-3.5 font-medium text-right">Hesap Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-[#86868B]">
                    Kullanıcılar yükleniyor...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-[#86868B]">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const st = USER_STATUS_STYLE[u.status] || USER_STATUS_STYLE.ACTIVE;
                  return (
                    <tr key={u.id} className="hover:bg-[#FAFAFC] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#1D1D1F]">{u.full_name}</div>
                        <div className="text-[11px] text-[#86868B]">{u.email}</div>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#6E6E73] max-w-[260px] truncate">
                        {u.address || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums font-semibold text-[#248A3D]">
                        {formatTL(u.lifetime_value)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <select
                          value={u.status}
                          onChange={(e) => handleStatusChange(u.id, e.target.value)}
                          className="px-3 py-1.5 rounded-full bg-[#F5F5F7] border border-black/[0.06] text-[12px] font-medium text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] cursor-pointer"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Musteri Modali */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-black/[0.06] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Yeni Müşteri Ekle</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0532..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                  Teslimat Adresi
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="py-2.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[13px] font-medium cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-medium cursor-pointer disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Müşteriyi Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
