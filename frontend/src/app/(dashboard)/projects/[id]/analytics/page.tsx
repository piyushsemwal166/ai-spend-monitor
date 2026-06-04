"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, Bar } from "recharts";
import { BarChart3, Timer, Wallet, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { useAuth } from "@/providers/auth-provider";
import { analyticsService } from "@/services/analyticsService";
import { formatCurrency, formatCompactNumber } from "@/lib/format";

export default function ProjectAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { user, isLoading: isAuthLoading } = useAuth();

  const analyticsQuery = useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: () => analyticsService.getProjectAnalytics(projectId),
    enabled: Boolean(projectId) && Boolean(user),
  });

  if (isAuthLoading || analyticsQuery.isLoading) return <LoadingSpinner />;
  if (!user) return <EmptyState title="Sign in to view project analytics" description="Project analytics are hidden until you authenticate." actionLabel="Go to login" />;
  if (analyticsQuery.isError || !analyticsQuery.data) return <EmptyState title="Project analytics unavailable" description="Unable to load project analytics for this project." actionLabel="Back to projects" />;

  const data = analyticsQuery.data;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader eyebrow="Project analytics" title="Spend and usage trends for this project." description="Inspect requests, spend, tokens, and model mix." actions={<Link href={`/projects/${projectId}`} className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-white">Back to project</Link>} />

      <section className="grid gap-5 md:grid-cols-4">
        {[
          { title: "Spend", value: formatCurrency(data.spend), icon: Wallet },
          { title: "Requests", value: formatCompactNumber(data.requests), icon: BarChart3 },
          { title: "Tokens", value: formatCompactNumber(data.tokens), icon: FileText },
          { title: "Models", value: String(data.modelUsage.length), icon: Timer },
        ].map((item) => (
          <Card key={item.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="flex items-center justify-between p-6"><div className="space-y-2"><p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p><p className="font-display text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950"><item.icon className="h-5 w-5" /></div></CardContent></Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Daily requests</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={data.dailyRequests}><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><RechartsTooltip /><Line type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Daily cost</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={data.dailyCost}><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><RechartsTooltip formatter={(value) => formatCurrency(Number(value ?? 0))} /><Line type="monotone" dataKey="spend" stroke="#2563eb" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Model usage</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={data.modelUsage}><XAxis dataKey="model" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><RechartsTooltip /><Bar dataKey="usage" fill="#14b8a6" /></BarChart></ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Model breakdown</CardTitle></CardHeader>
          <CardContent>
            <DataTable<any> rowKey={(row) => row.model} columns={[{ header: "Model", accessor: "model" }, { header: "Usage", cell: (row) => formatCompactNumber(row.usage) }, { header: "Spend", cell: (row) => formatCurrency(row.spend) }, { header: "Tokens", cell: (row) => formatCompactNumber(row.tokens) }]} data={data.modelUsage} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
