import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactElement } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
  secondary:
    "bg-white/80 text-slate-950 ring-1 ring-black/10 hover:-translate-y-0.5 hover:bg-white dark:bg-slate-900/70 dark:text-white dark:ring-white/10",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
  outline:
    "border border-slate-200 bg-white/60 text-slate-950 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-white",
  danger:
    "bg-rose-600 text-white shadow-lg shadow-rose-600/15 hover:-translate-y-0.5 hover:bg-rose-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({ className, variant = "primary", size = "md", asChild, ...props }: ButtonProps) {
  if (asChild && props.children) {
    return props.children as ReactElement;
  }

  return <button className={buttonClassName({ variant, size, className })} {...props} />;
}