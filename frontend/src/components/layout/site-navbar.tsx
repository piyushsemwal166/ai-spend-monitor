"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu, ShieldCheck, X } from "lucide-react";
import { marketingLinks } from "@/constants/navigation";
import { buttonClassName } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function SiteNavbar() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    setMobileOpen(false);
    router.refresh();
  };

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
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/about" className={buttonClassName({ variant: "ghost", size: "sm" })}>
            About Us
          </Link>
          {isLoading ? null : user ? (
            <>
              <Link href="/dashboard" className={buttonClassName({ variant: "primary", size: "sm" })}>
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={handleLogout} className={buttonClassName({ variant: "secondary", size: "sm" })}>
                Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className={buttonClassName({ variant: "secondary", size: "sm", className: "lg:hidden" })}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Menu
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 px-4 py-4 sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <nav className="grid gap-2">
              {marketingLinks.map((item) => (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/about" onClick={() => setMobileOpen(false)} className={buttonClassName({ variant: "ghost", size: "sm", className: "w-full" })}>
                About Us
              </Link>
              {isLoading ? null : user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={buttonClassName({ variant: "primary", size: "sm", className: "w-full" })}>
                    Dashboard
                  </Link>
                  <button type="button" onClick={handleLogout} className={buttonClassName({ variant: "secondary", size: "sm", className: "w-full" })}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className={buttonClassName({ variant: "ghost", size: "sm", className: "w-full" })}>
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className={buttonClassName({ variant: "secondary", size: "sm", className: "w-full" })}>
                    Sign up
                  </Link>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={buttonClassName({ variant: "primary", size: "sm", className: "col-span-2 w-full" })}>
                    Explore Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}