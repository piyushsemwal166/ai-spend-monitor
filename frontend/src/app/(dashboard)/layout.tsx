import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { ProtectedRoute } from "@/components/layout/protected-route";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-grid">
        <Sidebar />
        <div className="flex min-h-screen flex-col lg:pl-72">
          <TopNavbar />
          <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8">{children}</main>
        </div>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}