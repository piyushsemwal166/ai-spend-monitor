"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { BudgetChart } from "@/components/dashboard/budget-chart";
import { SpendChart } from "@/components/dashboard/spend-chart";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { ArrowUpRight, FolderKanban, ShieldCheck, Wallet } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { subscriptionService } from "@/services/subscriptionService";
import { projectService } from "@/services/projectService";
import { usageLogService } from "@/services/usageLogService";
import { formatCurrency, formatCompactNumber, formatDate } from "@/lib/format";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const summaryQuery = useQuery({ queryKey: ["dashboard-summary"], queryFn: dashboardService.getSummary, enabled: Boolean(user) });
  const dailyQuery = useQuery({ queryKey: ["dashboard-daily-spend"], queryFn: dashboardService.getDailySpend, enabled: Boolean(user) });
  const monthlyQuery = useQuery({ queryKey: ["dashboard-monthly-spend"], queryFn: dashboardService.getMonthlySpend, enabled: Boolean(user) });

  // Debug logging for chart data flow
  if (dailyQuery.data && dailyQuery.data.length > 0) {
    console.debug("Dashboard: Daily spend data received:", { count: dailyQuery.data.length, sample: dailyQuery.data[0] });
  }
  if (monthlyQuery.data && monthlyQuery.data.length > 0) {
    console.debug("Dashboard: Monthly spend data received:", { count: monthlyQuery.data.length, sample: monthlyQuery.data[0] });
  }
  const projectsQuery = useQuery({ queryKey: ["dashboard-projects"], queryFn: () => projectService.getProjects(), enabled: Boolean(user) });
  const usageLogsQuery = useQuery({ queryKey: ["dashboard-usage-logs"], queryFn: () => usageLogService.getUsageLogs({ limit: 10, sortBy: "createdAt", sortOrder: "desc" }), enabled: Boolean(user) });
  const subscriptionQuery = useQuery({ queryKey: ["subscription-current"], queryFn: subscriptionService.getCurrent, enabled: Boolean(user) });

  const stats = useMemo(
    () => [
      { title: "Today's Spend", value: formatCurrency(summaryQuery.data?.todaySpend ?? 0), change: "Live from the API", trend: "up" as const, icon: Wallet },
      { title: "Monthly Spend", value: formatCurrency(summaryQuery.data?.monthlySpend ?? 0), change: "This month", trend: "up" as const, icon: ArrowUpRight },
      { title: "Remaining Budget", value: formatCurrency(summaryQuery.data?.remainingBudget ?? 0), change: "Across active budgets", trend: "flat" as const, icon: ShieldCheck },
      { title: "Total Projects", value: String(summaryQuery.data?.totalProjects ?? 0), change: "Active in workspace", trend: "up" as const, icon: FolderKanban },
    ],
    [summaryQuery.data],
  );

  const usageStats = useMemo(
    () => [
      { title: "Total Requests", value: formatCompactNumber(summaryQuery.data?.totalRequests ?? 0), change: "All Gemini calls", trend: "up" as const, icon: ArrowUpRight },
      { title: "Total Tokens", value: formatCompactNumber(summaryQuery.data?.totalTokens ?? 0), change: "Input + output", trend: "up" as const, icon: Wallet },
      { title: "Estimated Cost", value: formatCurrency(summaryQuery.data?.estimatedCost ?? 0), change: "Pricing-based estimate", trend: "up" as const, icon: ShieldCheck },
      { title: "Most Used Model", value: summaryQuery.data?.mostUsedModel ?? "-", change: "Top model by request count", trend: "flat" as const, icon: FolderKanban },
    ],
    [summaryQuery.data],
  );

  const activityItems = useMemo(
    () =>
      (usageLogsQuery.data?.items ?? []).slice(0, 3).map((item) => ({
        label: `${item.provider} usage recorded`,
        detail: `${item.project?.name ?? "Project"} used ${item.model} for ${formatCompactNumber(item.tokens)} tokens.`,
        timestamp: item.createdAt,
      })),
    [usageLogsQuery.data],
  );

  const budgetUtilization = useMemo(() => {
    const monthlySpend = summaryQuery.data?.monthlySpend ?? 0;
    const remainingBudget = summaryQuery.data?.remainingBudget ?? 0;
    const totalBudget = monthlySpend + remainingBudget;
    return totalBudget > 0 ? Math.round((monthlySpend / totalBudget) * 100) : 0;
  }, [summaryQuery.data]);

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in to view the dashboard"
        description="Your workspace data is hidden until you authenticate."
        actionLabel="Go to login"
      />
    );
  }

  if (summaryQuery.isLoading || dailyQuery.isLoading || monthlyQuery.isLoading || projectsQuery.isLoading || usageLogsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (summaryQuery.isError || dailyQuery.isError || monthlyQuery.isError || projectsQuery.isError || usageLogsQuery.isError) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description="One or more API requests failed. Check the backend connection and your session token."
        actionLabel="Refresh"
      />
    );
  }

  return (
    <div className="space-y-6 pb-10 sm:space-y-8">
      {subscriptionQuery.data?.plan?.slug === "free" ? (
        <div className="rounded-md border border-amber-200/60 bg-amber-50/60 p-4">
          <p className="text-sm font-medium text-amber-900">Upgrade to Pro to unlock OpenAI, Claude, Groq and advanced analytics.</p>
        </div>
      ) : null}
      <PageHeader
        eyebrow="Executive dashboard"
        title="Control AI spend with real-time visibility."
        description="A premium operating dashboard for finance, product, and engineering leaders monitoring AI usage, budgets, and projects."
        actions={
          <>
            <Badge variant="success">System healthy</Badge>
            <Badge variant="accent">{projectsQuery.data?.items.length ?? 0} portfolios active</Badge>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 sm:gap-5">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 sm:gap-5">
        {usageStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr] sm:gap-6">
        <SpendChart title="Daily Spend" description="A seven-day view of spend velocity across the platform." data={(dailyQuery.data ?? []) as unknown as Array<Record<string, string | number>>} xKey="date" valueKey="spend" />
        <BudgetChart title="Budget Utilization" description="Workspace remaining budget snapshot." data={[{ name: "Used", value: budgetUtilization }, { name: "Remaining", value: Math.max(100 - budgetUtilization, 0) }]} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] sm:gap-6">
        <SpendChart title="Monthly Spend" description="Month-over-month spend growth and seasonality." data={(monthlyQuery.data ?? []) as unknown as Array<Record<string, string | number>>} xKey="month" valueKey="spend" />
        <ActivityFeed title="Activity feed" items={activityItems} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2 sm:gap-6">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<any>
              rowKey={(row) => row.id}
              columns={[
                { header: "Name", accessor: "name" },
                { header: "Organization", cell: (row) => row.organization?.name ?? "-" },
                { header: "Spend", cell: (row) => formatCurrency(Number(row.budget?.currentSpend ?? 0)) },
                { header: "Budget", cell: (row) => formatCurrency(Number(row.budget?.monthlyBudget ?? 0)) },
                {
                  header: "Status",
                  cell: (row) => (
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      {String(row.status)}
                    </span>
                  ),
                },
              ]}
              data={projectsQuery.data?.items ?? []}
            />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Recent Usage Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<any>
              rowKey={(row) => row.id}
              columns={[
                { header: "Project", cell: (row) => row.project?.name ?? "-" },
                { header: "Provider", accessor: "provider" },
                { header: "Tokens", cell: (row) => formatCompactNumber(Number(row.tokens)) },
                { header: "Cost", cell: (row) => formatCurrency(Number(row.cost)) },
                { header: "Date", cell: (row) => formatDate(String(row.createdAt)) },
              ]}
              data={usageLogsQuery.data?.items ?? []}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}