import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-grid px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="glass-panel-strong overflow-hidden rounded-[2rem] p-5 text-white shadow-2xl shadow-slate-950/10 sm:p-8 lg:p-10">
          <div className="flex h-full flex-col justify-between gap-8 rounded-[1.6rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-5 sm:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur">
                Enterprise AI spend control
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">One platform for AI budgets, usage, and governance.</h1>
              <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                AI Spend OS helps finance and product teams stay ahead of spend with polished dashboards, live budgets, and actionable controls.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                { label: "Visibility", value: "100%" },
                { label: "Projects", value: "128" },
                { label: "Savings identified", value: "$42k" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:p-5">
                  <p className="text-sm text-slate-300">{metric.label}</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">{metric.value}</p>
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