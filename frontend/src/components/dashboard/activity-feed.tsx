import { formatDate } from "@/lib/format";

export function ActivityFeed({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; detail: string; timestamp: string }>;
}) {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Latest usage and governance signals.</p>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={`${item.label}-${item.timestamp}`} className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium text-slate-950 dark:text-white">{item.label}</p>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{formatDate(item.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}