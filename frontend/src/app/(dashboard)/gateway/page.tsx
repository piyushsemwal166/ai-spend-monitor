"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock3, Timer, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuth } from "@/providers/auth-provider";
import { gatewayService } from "@/services/gatewayService";
import { formatCompactNumber, formatCurrency } from "@/lib/format";

export default function GatewayPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const overviewQuery = useQuery({ queryKey: ["gateway-overview"], queryFn: gatewayService.getOverview, enabled: Boolean(user) });
  const logsQuery = useQuery({ queryKey: ["gateway-logs-preview"], queryFn: () => gatewayService.getLogs({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }), enabled: Boolean(user) });

  if (isAuthLoading || overviewQuery.isLoading || logsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to view the gateway" description="Gateway monitoring is hidden until you authenticate." actionLabel="Go to login" />;
  }

  const providerUsage = overviewQuery.data?.providerUsage ?? [];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Gateway"
        title="Centralized AI execution and monitoring."
        description="Track requests, latency, cost, and provider usage from one operational surface."
        actions={<Link href="/gateway/logs" className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-white">View logs</Link>}
      />

      <section className="grid gap-4 md:grid-cols-3 sm:gap-5">
        {[
          { title: "Total Requests", value: formatCompactNumber(overviewQuery.data?.totalRequests ?? 0), icon: Activity },
          { title: "Average Cost", value: formatCurrency(overviewQuery.data?.averageCost ?? 0), icon: Wallet },
          { title: "Average Latency", value: `${Math.round(overviewQuery.data?.averageLatency ?? 0)} ms`, icon: Clock3 },
        ].map((item) => (
          <Card key={item.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
                <p className="font-display text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">{item.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <item.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr] sm:gap-7">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Provider usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            {providerUsage.length === 0 ? (
              <EmptyState title="No gateway activity yet" description="Send a request through the gateway to populate provider usage." actionLabel="Go to AI Playground" />
            ) : (
              providerUsage.map((row) => (
                <div key={row.provider} className="space-y-2 rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-slate-950 dark:text-white">{row.provider}</span>
                    <Badge variant="accent">{formatCompactNumber(row.requests)} requests</Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>{formatCurrency(row.totalSpend)}</span>
                    <span>{Math.round(row.averageLatency)} ms avg latency</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Latest gateway activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <DataTable<any>
              rowKey={(row) => row.id}
              columns={[
                { header: "Project", cell: (row) => row.project?.name ?? "-" },
                { header: "Provider", accessor: "provider" },
                { header: "Cost", cell: (row) => formatCurrency(Number(row.estimatedCost ?? 0)) },
                { header: "Latency", cell: (row) => `${Math.round(Number(row.latency ?? 0))} ms` },
                { header: "Status", cell: (row) => <Badge variant={row.status === "SUCCESS" ? "success" : row.status === "BLOCKED" ? "warning" : "danger"}>{row.status}</Badge> },
              ]}
              data={logsQuery.data?.items ?? []}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
