"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users2, FolderKanban, Wallet, Timer } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuth } from "@/providers/auth-provider";
import { analyticsService } from "@/services/analyticsService";
import { budgetMonitorService } from "@/services/budgetMonitorService";
import { formatCurrency, formatCompactNumber } from "@/lib/format";

export default function AnalyticsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const overviewQuery = useQuery({ queryKey: ["analytics-overview"], queryFn: analyticsService.getOverview, enabled: Boolean(user) });
  const usersQuery = useQuery({ queryKey: ["analytics-top-users"], queryFn: analyticsService.getTopUsers, enabled: Boolean(user) });
  const teamsQuery = useQuery({ queryKey: ["analytics-top-teams"], queryFn: analyticsService.getTopTeams, enabled: Boolean(user) });
  const projectsQuery = useQuery({ queryKey: ["analytics-top-projects"], queryFn: analyticsService.getTopProjects, enabled: Boolean(user) });
  const modelsQuery = useQuery({ queryKey: ["analytics-models"], queryFn: analyticsService.getModels, enabled: Boolean(user) });
  const budgetQuery = useQuery({ queryKey: ["budget-status"], queryFn: budgetMonitorService.getStatus, enabled: Boolean(user) });

  if (isAuthLoading || overviewQuery.isLoading || usersQuery.isLoading || teamsQuery.isLoading || projectsQuery.isLoading || modelsQuery.isLoading || budgetQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to view analytics" description="Analytics are hidden until you authenticate." actionLabel="Go to login" />;
  }

  const alertVariant = budgetQuery.data?.status === "EXCEEDED" ? "danger" : budgetQuery.data?.status === "CRITICAL" ? "warning" : budgetQuery.data?.status === "WARNING" ? "warning" : "success";

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Analytics"
        title="Business visibility across users, teams, projects, and models."
        description="Track who is spending, which team is driving usage, and which budgets need attention."
        actions={<Link href="/teams" className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-white">Manage teams</Link>}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {[
          { title: "Total Spend", value: formatCurrency(overviewQuery.data?.totalSpend ?? 0), icon: Wallet },
          { title: "Total Requests", value: formatCompactNumber(overviewQuery.data?.totalRequests ?? 0), icon: BarChart3 },
          { title: "Total Tokens", value: formatCompactNumber(overviewQuery.data?.totalTokens ?? 0), icon: Timer },
          { title: "Active Users", value: String(overviewQuery.data?.activeUsers ?? 0), icon: Users2 },
          { title: "Active Projects", value: String(overviewQuery.data?.activeProjects ?? 0), icon: FolderKanban },
        ].map((item) => (
          <Card key={item.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-2"><p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p><p className="font-display text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950"><item.icon className="h-5 w-5" /></div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Budget monitoring</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>{formatCurrency(budgetQuery.data?.currentSpend ?? 0)} used</span>
              <span>{budgetQuery.data?.utilizationPercentage ?? 0}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200/80 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" style={{ width: `${Math.min(budgetQuery.data?.utilizationPercentage ?? 0, 100)}%` }} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={alertVariant as never}>{budgetQuery.data?.status ?? "NORMAL"}</Badge>
              <span className="text-sm text-slate-500 dark:text-slate-400">Remaining: {formatCurrency(budgetQuery.data?.remainingBudget ?? 0)}</span>
            </div>
            {(budgetQuery.data?.status === "WARNING" || budgetQuery.data?.status === "CRITICAL" || budgetQuery.data?.status === "EXCEEDED") ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                {budgetQuery.data.status === "WARNING" ? "Project has reached 80% budget." : budgetQuery.data.status === "CRITICAL" ? "Project has reached 90% budget." : "Budget exceeded."}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Spend posture</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between"><span>Avg cost per request</span><span>{formatCurrency((overviewQuery.data?.totalSpend ?? 0) / Math.max(overviewQuery.data?.totalRequests ?? 1, 1))}</span></div>
            <div className="flex items-center justify-between"><span>Most used model</span><span>{modelsQuery.data?.[0]?.model ?? "-"}</span></div>
            <div className="flex items-center justify-between"><span>Top spending project</span><span>{projectsQuery.data?.[0]?.project.name ?? "-"}</span></div>
            <div className="flex items-center justify-between"><span>Top spending team</span><span>{teamsQuery.data?.[0]?.team.name ?? "-"}</span></div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Top Users</CardTitle></CardHeader>
          <CardContent>
            <DataTable<any> rowKey={(row) => row.user.id} columns={[{ header: "User", cell: (row) => row.user.name }, { header: "Spend", cell: (row) => formatCurrency(row.totalSpend) }, { header: "Requests", cell: (row) => formatCompactNumber(row.totalRequests) }, { header: "Tokens", cell: (row) => formatCompactNumber(row.totalTokens) }]} data={usersQuery.data ?? []} />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Top Teams</CardTitle></CardHeader>
          <CardContent>
            <DataTable<any> rowKey={(row) => row.team.id ?? row.team.name} columns={[{ header: "Team", cell: (row) => row.team.name }, { header: "Spend", cell: (row) => formatCurrency(row.totalSpend) }, { header: "Requests", cell: (row) => formatCompactNumber(row.totalRequests) }, { header: "Tokens", cell: (row) => formatCompactNumber(row.totalTokens) }]} data={teamsQuery.data ?? []} />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Top Projects</CardTitle></CardHeader>
          <CardContent>
            <DataTable<any> rowKey={(row) => row.project.id} columns={[{ header: "Project", cell: (row) => row.project.name }, { header: "Spend", cell: (row) => formatCurrency(row.totalSpend) }, { header: "Requests", cell: (row) => formatCompactNumber(row.totalRequests) }, { header: "Tokens", cell: (row) => formatCompactNumber(row.totalTokens) }]} data={projectsQuery.data ?? []} />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Model Usage</CardTitle></CardHeader>
          <CardContent>
            <DataTable<any> rowKey={(row) => row.model} columns={[{ header: "Model", accessor: "model" }, { header: "Usage", cell: (row) => formatCompactNumber(row.totalUsage) }, { header: "Spend", cell: (row) => formatCurrency(row.totalSpend) }, { header: "Tokens", cell: (row) => formatCompactNumber(row.tokenCount) }]} data={modelsQuery.data ?? []} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
