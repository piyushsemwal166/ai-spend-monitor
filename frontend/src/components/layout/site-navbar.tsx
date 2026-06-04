import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { marketingLinks } from "@/constants/navigation";
import { buttonClassName } from "@/components/ui/button";

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/50 backdrop-blur-xl dark:bg-slate-950/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-display text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-5 w-5" />
          </span>
          AI Spend OS
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {marketingLinks.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonClassName({ variant: "ghost", size: "sm" })}>
            Login
          </Link>
          <Link href="/register" className={buttonClassName({ variant: "secondary", size: "sm" })}>
            Sign up
          </Link>
          <Link href="/dashboard" className={buttonClassName({ variant: "primary", size: "sm" })}>
            Explore Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}