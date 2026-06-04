"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileText, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuth } from "@/providers/auth-provider";
import { projectService } from "@/services/projectService";
import { usageLogService, type UsageLogRecord } from "@/services/usageLogService";
import { formatCompactNumber, formatCurrency, formatDate } from "@/lib/format";

type ProjectRow = {
  id: string;
  name: string;
  description?: string | null;
  organization?: { id: string; name: string; slug: string };
};

export default function ProjectUsagePage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { user, isLoading: isAuthLoading } = useAuth();

  const projectQuery = useQuery({
    queryKey: ["project-usage-project", projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: Boolean(projectId) && Boolean(user),
  });

  const usageQuery = useQuery({
    queryKey: ["project-usage-logs", projectId],
    queryFn: () => usageLogService.getUsageByProject(projectId),
    enabled: Boolean(projectId) && Boolean(user),
  });

  const project = projectQuery.data as ProjectRow | undefined;
  const logs = (usageQuery.data?.items ?? []) as unknown as UsageLogRecord[];

  const summary = useMemo(() => {
    return {
      requests: logs.reduce((sum, item) => sum + Number(item.requestCount ?? 1), 0),
      tokens: logs.reduce((sum, item) => sum + Number(item.totalTokens ?? item.tokens), 0),
      cost: logs.reduce((sum, item) => sum + Number(item.estimatedCost ?? item.cost), 0),
    };
  }, [logs]);

  const recentLogs = useMemo(() => logs.slice(0, 20), [logs]);

  if (isAuthLoading || projectQuery.isLoading || usageQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to view project usage" description="Usage analytics are hidden until you authenticate." actionLabel="Go to login" />;
  }

  if (projectQuery.isError || !project) {
    return <EmptyState title="Project not found" description="The project may not exist or you may not have access to it." actionLabel="Back to projects" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Project usage"
        title={`${project.name} usage history`}
        description="Track request volume, tokens, and estimated spend for this project."
      />

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Requests", value: formatCompactNumber(summary.requests), icon: ArrowUpRight },
          { title: "Tokens", value: formatCompactNumber(summary.tokens), icon: FileText },
          { title: "Estimated cost", value: formatCurrency(summary.cost), icon: Wallet },
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

      <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
        <CardHeader>
          <CardTitle>Usage history</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<UsageLogRecord>
            rowKey={(row) => row.id}
            columns={[
              { header: "Date", cell: (row) => formatDate(row.createdAt) },
              { header: "Model", accessor: "model" },
              { header: "Provider", accessor: "provider" },
              { header: "Input Tokens", cell: (row) => formatCompactNumber(Number(row.inputTokens ?? 0)) },
              { header: "Output Tokens", cell: (row) => formatCompactNumber(Number(row.outputTokens ?? 0)) },
              { header: "Total Tokens", cell: (row) => formatCompactNumber(Number(row.totalTokens ?? row.tokens)) },
              { header: "Estimated Cost", cell: (row) => formatCurrency(Number(row.estimatedCost ?? row.cost)) },
            ]}
            data={recentLogs}
          />
        </CardContent>
      </Card>
    </div>
  );
}