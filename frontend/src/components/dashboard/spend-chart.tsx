"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function SpendChart({
  title,
  description,
  data,
  xKey,
  valueKey = "value",
}: {
  title: string;
  description: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  valueKey?: string;
}) {
  if (data.length > 0) {
    console.debug(`SpendChart (${title}): data length=${data.length}, xKey=${xKey}, valueKey=${valueKey}, sample=`, data[0]);
  }

  return (
    <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} stroke="rgba(100, 116, 139, 0.8)" />
              <YAxis tickLine={false} axisLine={false} stroke="rgba(100, 116, 139, 0.8)" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                contentStyle={{
                  borderRadius: 20,
                  background: "rgba(15, 23, 42, 0.92)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Area type="monotone" dataKey={valueKey} stroke="#14b8a6" strokeWidth={3} fill="url(#spendGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}