"use client";

import { Cell, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ name: string; value: number }>;
}) {
  const value = data[0]?.value ?? 0;

  return (
    <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex h-80 w-full min-w-0 items-center justify-center">
          <ResponsiveContainer width="100%" height={320}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={18} data={data} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={999}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={index === 0 ? "#0f766e" : "rgba(148, 163, 184, 0.18)"} />
                ))}
              </RadialBar>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute flex flex-col items-center text-center">
            <span className="font-display text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}%</span>
            <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">Budget utilized</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}