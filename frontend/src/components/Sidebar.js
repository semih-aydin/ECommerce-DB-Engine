"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import AydinStoreLogo from "./AydinStoreLogo";

const NAV_ITEMS = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/orders", label: "Siparişler" },
  { href: "/admin/inventory", label: "Ürün & Stok" },
  { href: "/admin/users", label: "Kullanıcılar" },
  { href: "/admin/audit", label: "Denetim Kayıtları" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.08]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Sol: Logo + Yonetim etiketi */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/admin" className="flex items-center">
            <AydinStoreLogo dark={false} />
          </Link>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F5F5F7] border border-black/[0.06] text-[11px] font-medium text-[#6E6E73] tracking-tight">
            Yönetim
          </span>
        </div>

        {/* Orta: Apple-style pill navigasyon (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-full border border-black/[0.05]">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sag: DB durumu + Magaza linki */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F5F7] border border-black/[0.05] text-[12px] text-[#6E6E73]">
            <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
            <span className="font-medium text-[#1D1D1F]">PostgreSQL 16</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1D1D1F] hover:bg-[#333336] text-white text-[13px] font-medium transition-colors"
          >
            <span>Mağaza</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Mobil Alt Navigasyon */}
      <div className="md:hidden border-t border-black/[0.05] px-4 py-2 overflow-x-auto flex items-center gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                isActive
                  ? "bg-[#1D1D1F] text-white"
                  : "bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
