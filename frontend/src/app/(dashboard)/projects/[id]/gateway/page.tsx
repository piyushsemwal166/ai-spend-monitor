"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { Activity, Clock3, Wallet, Workflow } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { useAuth } from "@/providers/auth-provider";
import { gatewayService } from "@/services/gatewayService";
import { formatCompactNumber, formatCurrency, formatDate } from "@/lib/format";

export default function ProjectGatewayPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { user, isLoading: isAuthLoading } = useAuth();

  const analyticsQuery = useQuery({
    queryKey: ["project-gateway", projectId],
    queryFn: () => gatewayService.getProjectGateway(projectId),
    enabled: Boolean(projectId) && Boolean(user),
  });

  const data = analyticsQuery.data;
  const requestHistory = data?.requestHistory ?? [];
  const providerUsage = data?.providerUsage ?? [];
  const costHistory = data?.costHistory ?? [];
  const latencyHistory = data?.latencyHistory ?? [];

  const providerPie = useMemo(() => providerUsage.map((row) => ({ name: row.provider, value: row.totalSpend })), [providerUsage]);

  if (isAuthLoading || analyticsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to view project gateway analytics" description="Gateway analytics are hidden until you authenticate." actionLabel="Go to login" />;
  }

  if (analyticsQuery.isError || !data) {
    return <EmptyState title="Project gateway unavailable" description="Unable to load project gateway analytics." actionLabel="Back to project" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Project gateway"
        title="Execution history and provider mix."
        description="Inspect gateway requests, response latency, and spend patterns for this project."
        actions={<Link href={`/projects/${projectId}`} className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-white">Back to project</Link>}
      />

      <section className="grid gap-5 md:grid-cols-4">
        {[
          { title: "Requests", value: formatCompactNumber(data.totalRequests), icon: Activity },
          { title: "Spend", value: formatCurrency(data.totalSpend), icon: Wallet },
          { title: "Avg Cost", value: formatCurrency(data.averageCost), icon: Workflow },
          { title: "Avg Latency", value: `${Math.round(data.averageLatency)} ms`, icon: Clock3 },
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

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Cost history</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costHistory}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <RechartsTooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Line type="monotone" dataKey="cost" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Latency history</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyHistory}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <RechartsTooltip formatter={(value) => `${Math.round(Number(value ?? 0))} ms`} />
                <Bar dataKey="latency" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Provider usage</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={providerPie} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {providerPie.map((entry, index) => (
                    <Cell key={entry.name} fill={index % 2 === 0 ? "#14b8a6" : "#2563eb"} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader><CardTitle>Request history</CardTitle></CardHeader>
          <CardContent>
            <DataTable<any>
              rowKey={(row) => row.id}
              columns={[
                { header: "Time", cell: (row) => formatDate(row.createdAt) },
                { header: "User", cell: (row) => row.user?.name ?? "-" },
                { header: "Team", cell: (row) => row.team?.name ?? "-" },
                { header: "Provider", accessor: "provider" },
                { header: "Model", accessor: "model" },
                { header: "Cost", cell: (row) => formatCurrency(Number(row.estimatedCost ?? 0)) },
                { header: "Latency", cell: (row) => `${Math.round(Number(row.latency ?? 0))} ms` },
                { header: "Status", accessor: "status" },
              ]}
              data={requestHistory}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
