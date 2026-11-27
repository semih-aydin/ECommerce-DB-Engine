import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "AydınStore — Teknoloji & Donanım Alışveriş Sitesi",
  description: "PostgreSQL ACID tabanlı E-Ticaret ve Sipariş Yönetim Sistemi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${jakarta.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full bg-[var(--bg-base)] text-[var(--ink-primary)] antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
