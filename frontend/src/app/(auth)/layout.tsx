import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-grid px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel-strong overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-950/10 lg:p-10">
          <div className="flex h-full flex-col justify-between gap-10 rounded-[1.6rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur">
                Enterprise AI spend control
              </div>
              <h1 className="font-display text-5xl font-semibold tracking-tight">One platform for AI budgets, usage, and governance.</h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300">
                AI Spend OS helps finance and product teams stay ahead of spend with polished dashboards, live budgets, and actionable controls.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Visibility", value: "100%" },
                { label: "Projects", value: "128" },
                { label: "Savings identified", value: "$42k" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-slate-300">{metric.label}</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}