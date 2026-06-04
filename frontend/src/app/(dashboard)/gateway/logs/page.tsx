"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { gatewayService } from "@/services/gatewayService";
import { formatCompactNumber, formatCurrency, formatDate } from "@/lib/format";

const statusOptions = ["", "SUCCESS", "BLOCKED", "FAILED"] as const;
const providerOptions = ["", "GEMINI", "OPENAI", "ANTHROPIC", "GOOGLE", "AZURE"] as const;

export default function GatewayLogsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("");
  const [provider, setProvider] = useState<(typeof providerOptions)[number]>("");
  const [page, setPage] = useState(1);

  const query = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    provider: provider || undefined,
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  }), [page, provider, search, status]);

  const logsQuery = useQuery({
    queryKey: ["gateway-logs", query],
    queryFn: () => gatewayService.getLogs(query),
    enabled: Boolean(user),
  });

  if (isAuthLoading || logsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to view gateway logs" description="Gateway logs are hidden until you authenticate." actionLabel="Go to login" />;
  }

  if (logsQuery.isError) {
    return <EmptyState title="Unable to load gateway logs" description="The API request failed. Check your session and backend connection." actionLabel="Refresh" />;
  }

  const items = logsQuery.data?.items ?? [];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader eyebrow="Gateway" title="Request audit log." description="Inspect every gateway execution attempt, budget block, and failure." />

      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
        <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search model or provider" />
        <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          {statusOptions.map((option) => <option key={option || "all-status"} value={option}>{option || "All statuses"}</option>)}
        </Select>
        <Select value={provider} onChange={(event) => setProvider(event.target.value as typeof provider)}>
          {providerOptions.map((option) => <option key={option || "all-providers"} value={option}>{option || "All providers"}</option>)}
        </Select>
        <Button type="button" variant="secondary" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}>Apply</Button>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="p-6"><p className="text-sm text-slate-500 dark:text-slate-400">Total logs</p><p className="mt-2 font-display text-3xl font-semibold text-slate-950 dark:text-white">{formatCompactNumber((logsQuery.data?.meta as any)?.totalCount ?? (logsQuery.data?.meta as any)?.total ?? 0)}</p></CardContent></Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="p-6"><p className="text-sm text-slate-500 dark:text-slate-400">Total spend</p><p className="mt-2 font-display text-3xl font-semibold text-slate-950 dark:text-white">{formatCurrency((logsQuery.data?.meta as any)?.totalSpend ?? 0)}</p></CardContent></Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="p-6"><p className="text-sm text-slate-500 dark:text-slate-400">Success rate</p><p className="mt-2 font-display text-3xl font-semibold text-slate-950 dark:text-white">{((logsQuery.data?.meta as any)?.totalCount ?? (logsQuery.data?.meta as any)?.total) ? `${(logsQuery.data?.meta as any)?.successRate ?? 0}%` : "0%"}</p></CardContent></Card>
      </section>

      <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
        <CardContent className="p-6">
          <DataTable<any>
            rowKey={(row) => row.id}
            columns={[
              { header: "User", cell: (row) => row.user?.name ?? "-" },
              { header: "Team", cell: (row) => row.team?.name ?? "-" },
              { header: "Project", cell: (row) => row.project?.name ?? "-" },
              { header: "Provider", accessor: "provider" },
              { header: "Model", accessor: "model" },
              { header: "Cost", cell: (row) => formatCurrency(Number(row.estimatedCost ?? 0)) },
              { header: "Latency", cell: (row) => `${Math.round(Number(row.latency ?? 0))} ms` },
              { header: "Status", cell: (row) => <Badge variant={row.status === "SUCCESS" ? "success" : row.status === "BLOCKED" ? "warning" : "danger"}>{row.status}</Badge> },
              { header: "Timestamp", cell: (row) => formatDate(row.createdAt) },
            ]}
            data={items}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Page {logsQuery.data?.meta.page ?? 1} of {logsQuery.data?.meta.totalPages ?? 1}</span>
        <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={(logsQuery.data?.meta.page ?? 1) <= 1}>Previous</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.min(logsQuery.data?.meta.totalPages ?? 1, current + 1))} disabled={(logsQuery.data?.meta.page ?? 1) >= (logsQuery.data?.meta.totalPages ?? 1)}>Next</Button>
      </div>
    </div>
  );
}
