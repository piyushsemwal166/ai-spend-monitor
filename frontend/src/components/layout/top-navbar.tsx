"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Sparkles } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function TopNavbar() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    setIsProfileOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-white/65 px-4 py-4 backdrop-blur-xl dark:bg-slate-950/45 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="hidden min-w-0 flex-1 xl:block">
            <SearchInput placeholder="Search organizations, projects, budgets..." />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="hidden sm:inline-flex">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Live
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className={buttonClassName({ variant: "secondary", size: "sm" })}>
            Homepage
          </Link>
          <Button variant="secondary" size="sm" className="hidden xl:inline-flex">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <div className="relative">
            <button
              type="button"
              aria-expanded={isProfileOpen}
              onClick={() => setIsProfileOpen((current) => !current)}
              className={buttonClassName({ variant: "secondary", size: "sm" })}
              disabled={isLoading}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-[11px] font-semibold text-white">
                {isLoading ? "..." : user?.name?.slice(0, 1)?.toUpperCase() ?? "?"}
              </span>
              <span className="hidden sm:inline">
                {isLoading ? "Loading session..." : user?.name ?? "Not signed in"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {!isLoading && isProfileOpen ? (
              <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-white p-3 shadow-2xl shadow-slate-950/15 dark:bg-slate-950">
                <div className="space-y-1 border-b border-slate-200/80 pb-3 dark:border-white/10">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{user?.name ?? "Guest"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email ?? "No active session"}</p>
                </div>

                <div className="mt-3 space-y-2">
                  {user ? (
                    <>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                      >
                        Logout
                        <span className="text-xs text-rose-500/80">Sign out</span>
                      </button>
                    </>
                  ) : (
                    <a
                      href="/login"
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-500/10"
                    >
                      Sign in
                      <span className="text-xs text-cyan-600/80">Go to login</span>
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}