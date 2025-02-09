"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./SideBar";
import Header from "./Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ✅ Get current path

  const isAuthPage = pathname === "/login" || pathname === "/register"; // 🚨 Add other auth pages if needed
console.log("<<<isAuthPage", isAuthPage)
  return (
    <div className="flex h-screen">
      {!isAuthPage && <Sidebar />} 
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isAuthPage && <Header />} {/* ✅ Hide header on login */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
