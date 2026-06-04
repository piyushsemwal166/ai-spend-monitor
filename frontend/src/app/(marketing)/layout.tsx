import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-grid">
      <SiteNavbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}