import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/75 dark:bg-slate-950/55">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                trend === "up" && "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
                trend === "down" && "bg-rose-500/12 text-rose-700 dark:text-rose-300",
                trend === "flat" && "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
              )}
            >
              {trend === "down" ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
              {change}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}