"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { ArrowUpRight, ChartSpline, FileText, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuth } from "@/providers/auth-provider";
import { analyticsService } from "@/services/analyticsService";
import { projectService } from "@/services/projectService";
import { usageLogService } from "@/services/usageLogService";
import { formatCurrency, formatDate } from "@/lib/format";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  organization?: { id: string; name: string; slug: string } | null;
  budget?: {
    monthlyBudget: string | number;
    currentSpend: string | number;
    remainingBudget: string | number;
    alertThreshold: number;
  } | null;
};

type UsageLogRow = {
  id: string;
  model: string;
  provider: string;
  tokens: number;
  cost: number;
  requestCount: number;
  createdAt: string;
};

type ProjectAnalytics = {
  spend: number;
  requests: number;
  tokens: number;
  dailyRequests: Array<{ date: string; requests: number }>;
  dailyCost: Array<{ date: string; spend: number }>;
  modelUsage: Array<{ model: string; usage: number; spend: number; tokens: number }>;
};

function buildDailySeries(logs: UsageLogRow[]) {
  const grouped = new Map<string, number>();
  for (const log of logs) {
    const day = new Date(log.createdAt).toISOString().slice(0, 10);
    grouped.set(day, (grouped.get(day) ?? 0) + Number(log.cost));
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, spend]) => ({ date, spend }));
}

function buildMonthlySeries(logs: UsageLogRow[]) {
  const grouped = new Map<string, number>();
  for (const log of logs) {
    const month = new Date(log.createdAt).toISOString().slice(0, 7);
    grouped.set(month, (grouped.get(month) ?? 0) + Number(log.cost));
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, spend]) => ({ month, spend }));
}

function buildProviderBreakdown(logs: UsageLogRow[]) {
  const grouped = new Map<string, number>();
  for (const log of logs) {
    grouped.set(log.provider, (grouped.get(log.provider) ?? 0) + Number(log.cost));
  }

  return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { user, isLoading: isAuthLoading } = useAuth();

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: Boolean(projectId) && Boolean(user),
  });

  const analyticsQuery = useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: () => analyticsService.getProjectAnalytics(projectId),
    enabled: Boolean(projectId) && Boolean(user),
  });

  const logsQuery = useQuery({
    queryKey: ["project-usage-logs", projectId],
    queryFn: () => usageLogService.getUsageLogs({ projectId, limit: 20, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: Boolean(projectId) && Boolean(user),
  });

  const project = projectQuery.data as ProjectRow | undefined;
  const analytics = analyticsQuery.data as ProjectAnalytics | undefined;
  const logs = (logsQuery.data?.items ?? []) as unknown as UsageLogRow[];

  const totalSpend = analytics?.spend ?? logs.reduce((sum, log) => sum + Number(log.cost), 0);
  const budget = Number(project?.budget?.monthlyBudget ?? 0);
  const currentSpend = Number(project?.budget?.currentSpend ?? totalSpend);
  const remainingBudget = Number(project?.budget?.remainingBudget ?? Math.max(budget - currentSpend, 0));
  const utilization = budget > 0 ? Math.round((currentSpend / budget) * 100) : 0;
  const totalRequests = analytics?.requests ?? logs.reduce((sum, log) => sum + Number(log.requestCount ?? 1), 0);

  const dailySeries = useMemo(() => buildDailySeries(logs), [logs]);
  const monthlySeries = useMemo(() => buildMonthlySeries(logs), [logs]);
  const providerBreakdown = useMemo(() => buildProviderBreakdown(logs), [logs]);
  const analyticsDailyCost = analytics?.dailyCost ?? [];
  const analyticsDailyRequests = analytics?.dailyRequests ?? [];
  const analyticsModelUsage = analytics?.modelUsage ?? [];
  const requestSeries = analyticsDailyRequests.length > 0
    ? analyticsDailyRequests.map((entry) => ({ key: entry.date, value: entry.requests }))
    : monthlySeries.map((entry) => ({ key: entry.month, value: entry.spend }));

  if (isAuthLoading || projectQuery.isLoading || analyticsQuery.isLoading || logsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to view project details" description="Project analytics are hidden until you authenticate." actionLabel="Go to login" />;
  }

  if (projectQuery.isError || !project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project may have been deleted or you may not have access to it."
        actionLabel="Back to projects"
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Projects"
        title={project.name}
        description="Spend analytics, budget details, usage logs, and cost breakdown for this project."
        actions={
          <>
            <Link href={`/projects/${project.id}/gateway`} className={buttonClassName({ variant: "secondary" })}>
              Gateway
            </Link>
            <Link href={`/projects/${project.id}/analytics`} className={buttonClassName({ variant: "secondary" })}>
              Analytics
            </Link>
            <Link href={`/projects/${project.id}/edit`} className={buttonClassName({ variant: "secondary" })}>
              Edit project
            </Link>
            <Link href="/projects/create" className={buttonClassName({ variant: "primary" })}>
              <ChartSpline className="h-4 w-4" />
              New project
            </Link>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Spend", value: formatCurrency(totalSpend), icon: Wallet },
          { title: "Budget utilization", value: `${utilization}%`, icon: ArrowUpRight },
          { title: "Organization", value: project.organization?.name ?? "-", icon: FileText },
        ].map((item) => (
          <Card key={item.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
                <p className="font-display text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <item.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Budget details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>{formatCurrency(currentSpend)} / {formatCurrency(budget)}</span>
                <span>{utilization}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200/80 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.min(utilization, 100)}%` }} />
              </div>
            </div>
            <Badge variant="success">{project.status}</Badge>
            <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
              {project.description ?? "This project is monitored continuously for cost spikes, provider mix shifts, and usage anomalies."}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Monthly budget</p>
                <p className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-white">{formatCurrency(budget)}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current spend</p>
                <p className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-white">{formatCurrency(currentSpend)}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Remaining</p>
                <p className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-white">{formatCurrency(remainingBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Cost breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={(analyticsModelUsage.length > 0 ? analyticsModelUsage.map((row) => ({ name: row.model, value: row.spend })) : providerBreakdown)} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                    {(analyticsModelUsage.length > 0 ? analyticsModelUsage.map((row) => ({ name: row.model, value: row.spend })) : providerBreakdown).map((entry, index) => (
                      <Cell key={entry.name} fill={index % 2 === 0 ? "#14b8a6" : "#2563eb"} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {providerBreakdown.length === 0 ? (
              <p>No usage logs yet.</p>
            ) : (
              providerBreakdown.map((item) => {
                const percent = totalSpend > 0 ? Math.round((item.value / totalSpend) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Spend analytics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 xl:grid-cols-2">
            <div>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Daily spend</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dailySeries} dataKey="spend" nameKey="date" innerRadius={70} outerRadius={110} paddingAngle={3}>
                      {dailySeries.map((entry, index) => (
                        <Cell key={entry.date} fill={index % 2 === 0 ? "#14b8a6" : "#0f766e"} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Monthly spend</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={requestSeries} dataKey="value" nameKey="key" innerRadius={70} outerRadius={110} paddingAngle={3}>
                      {requestSeries.map((entry, index) => (
                        <Cell key={entry.key} fill={index % 2 === 0 ? "#38bdf8" : "#2563eb"} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Usage logs</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<UsageLogRow>
              rowKey={(row) => row.id}
              columns={[
                { header: "Date", cell: (row) => formatDate(row.createdAt) },
                { header: "Provider", accessor: "provider" },
                { header: "Model", accessor: "model" },
                { header: "Tokens", cell: (row) => String(row.tokens) },
                { header: "Cost", cell: (row) => formatCurrency(Number(row.cost)) },
              ]}
              data={logs}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
