import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F] selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
      <Sidebar />
      <main className="flex-1 w-full">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
