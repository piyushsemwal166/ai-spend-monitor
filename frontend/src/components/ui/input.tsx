import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function inputClassName(className?: string) {
  return cn(
    "flex h-11 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500",
    className,
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClassName(className)} {...props} />;
}