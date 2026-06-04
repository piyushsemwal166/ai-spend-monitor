"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usageLogService } from "@/services/usageLogService";
import { formatCurrency, formatCompactNumber, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UsageLogRow = {
  id: string;
  model: string;
  provider: string;
  tokens: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  requestCount: number;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    organization?: { id: string; name: string; slug: string };
  };
};

type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function UsageLogsPage() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const { user, isLoading: isAuthLoading } = useAuth();

  const usageLogsQuery = useQuery({
    queryKey: ["usage-logs", appliedSearch, meta.page, meta.limit],
    queryFn: () => usageLogService.getUsageLogs({ page: meta.page, limit: meta.limit, search: appliedSearch || undefined, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: Boolean(user),
  });

  const summary = useMemo(() => {
    return {
      totalRequests: usageLogsQuery.data?.meta.totalRequests ?? 0,
      totalTokens: usageLogsQuery.data?.meta.totalTokens ?? 0,
      estimatedCost: usageLogsQuery.data?.meta.totalSpend ?? 0,
    };
  }, [usageLogsQuery.data?.meta]);

  const handleSearch = () => {
    setMeta((current) => ({ ...current, page: 1 }));
    setAppliedSearch(search.trim());
  };

  const handlePageChange = (nextPage: number) => {
    setMeta((current) => ({ ...current, page: nextPage }));
  };

  useEffect(() => {
    if (usageLogsQuery.data?.meta) {
      setMeta(usageLogsQuery.data.meta);
    }
  }, [usageLogsQuery.data?.meta]);

  const items = (usageLogsQuery.data?.items ?? []) as unknown as UsageLogRow[];

  if (isAuthLoading || usageLogsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to view usage logs" description="Your usage logs are hidden until you authenticate." actionLabel="Go to login" />;
  }

  if (usageLogsQuery.isError) {
    return <EmptyState title="Unable to load usage logs" description="Check the backend connection and your session token." actionLabel="Refresh" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Usage Logs"
        title="Track AI consumption across projects."
        description="Audit record of all API requests and resource usage. Automatically generated when models are executed."
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-xl gap-3">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search logs by model or provider" />
          <Button type="button" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>
            Page {meta.page} of {meta.totalPages || 1}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => handlePageChange(Math.max(1, meta.page - 1))} disabled={meta.page <= 1}>
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(meta.totalPages || 1, meta.page + 1))}
            disabled={meta.page >= (meta.totalPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Total requests", value: formatCompactNumber(summary.totalRequests) },
          { title: "Total tokens", value: formatCompactNumber(summary.totalTokens) },
          { title: "Estimated cost", value: formatCurrency(summary.estimatedCost) },
        ].map((item) => (
          <Card key={item.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
            <CardContent className="space-y-2 p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
              <p className="font-display text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
        <CardContent className="space-y-4 p-6">
          <DataTable<UsageLogRow>
            rowKey={(row) => row.id}
            columns={[
              { header: "Date", cell: (row) => formatDate(row.createdAt) },
              { header: "Organization", cell: (row) => row.project?.organization?.name ?? "-" },
              { header: "Project", cell: (row) => row.project?.name ?? "-" },
              { header: "Provider", accessor: "provider" },
              { header: "Model", accessor: "model" },
              { header: "Input Tokens", cell: (row) => formatCompactNumber(Number(row.inputTokens ?? 0)) },
              { header: "Output Tokens", cell: (row) => formatCompactNumber(Number(row.outputTokens ?? 0)) },
              { header: "Total Tokens", cell: (row) => formatCompactNumber(Number(row.totalTokens ?? row.tokens)) },
              { header: "Estimated Cost", cell: (row) => formatCurrency(Number(row.estimatedCost ?? row.cost)) },
            ]}
            data={items}
          />
        </CardContent>
      </Card>
    </div>
  );
}