"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}) {
  const router = useRouter();
  const normalizedLabel = actionLabel?.toLowerCase() ?? "";

  const inferredHref =
    actionHref ??
    (normalizedLabel.includes("login")
      ? "/login"
      : normalizedLabel.includes("create project")
        ? "/projects/create"
        : normalizedLabel.includes("create budget")
          ? "/budgets/create"
          : normalizedLabel.includes("create team")
            ? "/teams/create"
            : normalizedLabel.includes("back to projects")
              ? "/projects"
              : normalizedLabel.includes("back to budgets")
                ? "/budgets"
                : normalizedLabel.includes("back to teams")
                  ? "/teams"
                  : normalizedLabel.includes("go to ai playground")
                    ? "/ai-playground"
                    : undefined);

  const inferredOnClick =
    actionOnClick ??
    (normalizedLabel === "refresh"
      ? () => window.location.reload()
      : normalizedLabel.startsWith("back to")
        ? () => router.back()
        : undefined);

  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-3xl px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {actionLabel ? (
        inferredHref ? (
          <Link href={inferredHref} className={buttonClassName({ variant: "primary" })}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" className={buttonClassName({ variant: "primary" })} onClick={inferredOnClick}>
            {actionLabel}
          </button>
        )
      ) : null}
    </div>
  );
}
