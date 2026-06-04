"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { dashboardNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <aside
      className={cn(
        "glass-panel-strong fixed inset-y-0 left-0 z-50 flex h-full max-w-[calc(100vw-1rem)] flex-col border-r border-white/10 transition-all duration-300 lg:max-w-none",
        collapsed ? "w-20" : "w-72",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden font-display text-lg font-semibold text-slate-950 dark:text-white">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className={cn("transition-opacity", collapsed && "opacity-0")}>AI Spend OS</span>
        </Link>
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-full p-2 text-slate-500 hover:bg-white/60 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-6 px-4 py-5">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="hidden items-center gap-2 self-end rounded-full border border-white/10 bg-white/60 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-white dark:text-slate-300 dark:hover:bg-white/5 lg:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {collapsed ? null : "Collapse"}
        </button>

        <nav className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1">
          {dashboardNavigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white",
                  collapsed && "justify-center px-3",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn("transition-opacity", collapsed && "hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-2xl shadow-slate-950/20 dark:from-cyan-500 dark:to-blue-600">
          <p className={cn("text-sm font-medium text-white/80", collapsed && "hidden")}>Governance snapshot</p>
          <div className={cn("mt-4 grid gap-3 text-sm", collapsed && "hidden")}>
            <div className="flex items-center justify-between">
              <span>Budget coverage</span>
              <span>84%</span>
            </div>
            <div className="h-2 rounded-full bg-white/15">
              <div className="h-full w-[84%] rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-full border border-white/10 bg-white/80 p-3 shadow-lg shadow-slate-950/10 backdrop-blur-xl lg:hidden dark:bg-slate-950/70"
      >
        <Menu className="h-5 w-5 text-slate-950 dark:text-white" />
      </button>
      {nav}
      {mobileOpen ? <div className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
    </>
  );
}