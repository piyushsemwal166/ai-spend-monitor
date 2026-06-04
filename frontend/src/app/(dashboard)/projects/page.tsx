"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, FolderKanban, Gauge, AlertTriangle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projectService } from "@/services/projectService";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  organization?: { id: string; name: string; slug: string } | null;
  budget?: {
    monthlyBudget: string | number;
    currentSpend: string | number;
    remainingBudget: string | number;
    alertThreshold: number;
  } | null;
  _count?: {
    usageLogs: number;
  };
};

type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    const loadProjects = async () => {
      try {
        const response = await projectService.getProjects({ page: meta.page, limit: meta.limit, search: search || undefined, sortBy: "updatedAt", sortOrder: "desc" });
        setProjects(response.items as unknown as ProjectRow[]);
        setMeta(response.meta);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, [meta.page, meta.limit, search, user]);

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: async () => {
      if (user) {
        const response = await projectService.getProjects({ page: meta.page, limit: meta.limit, search: search || undefined, sortBy: "updatedAt", sortOrder: "desc" });
        setProjects(response.items as unknown as ProjectRow[]);
        setMeta(response.meta);
      }
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-projects"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!window.confirm(`Delete ${projectName}? This removes its budget and usage logs.`)) {
      return;
    }

    await toast.promise(deleteMutation.mutateAsync(projectId), {
      loading: "Deleting project...",
      success: "Project deleted.",
      error: (error) => (error instanceof Error ? error.message : "Unable to delete project."),
    });
  };

  const handleSearch = () => {
    setIsLoading(true);
    setMeta((current) => ({ ...current, page: 1 }));
    setSearch(searchInput.trim());
  };

  if (isAuthLoading || isLoading) {
    return <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Loading projects...</p>;
  }

  if (!user) {
    return <EmptyState title="Sign in to view projects" description="Your project list is hidden until you authenticate." actionLabel="Go to login" />;
  }

  const atRiskCount = projects.filter((project) => project.status !== "ACTIVE").length;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Projects"
        title="Track spend by product initiative."
        description="Manage project-level budgets, usage trends, and provider mix from one place."
        actions={
          <Link href="/projects/create" className={buttonClassName({ variant: "primary" })}>
            <FilePlus2 className="h-4 w-4" />
            Create Project
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3 sm:gap-5">
        {[
          { title: "Projects", value: String(projects.length), icon: FolderKanban },
          { title: "Watchlist", value: String(projects.filter((project) => project.status === "PAUSED").length), icon: Gauge },
          { title: "At risk", value: String(atRiskCount), icon: AlertTriangle },
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search projects" />
          <Button type="button" variant="secondary" onClick={handleSearch} className="w-full sm:w-auto">
            Search
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>
            Page {meta.page} of {meta.totalPages || 1}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => setMeta((current) => ({ ...current, page: Math.max(1, current.page - 1) }))} disabled={meta.page <= 1}>
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMeta((current) => ({ ...current, page: Math.min(current.totalPages || 1, current.page + 1) }))}
            disabled={meta.page >= (meta.totalPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
        <CardHeader>
          <CardTitle>Project list</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <DataTable<ProjectRow>
            rowKey={(row) => row.id}
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Organization", cell: (row) => row.organization?.name ?? "-" },
              { header: "Status", cell: (row) => <Badge variant={row.status === "ACTIVE" ? "success" : row.status === "PAUSED" ? "warning" : "danger"}>{row.status}</Badge> },
              { header: "Budget", cell: (row) => formatCurrency(Number(row.budget?.monthlyBudget ?? 0)) },
              { header: "Spent", cell: (row) => formatCurrency(Number(row.budget?.currentSpend ?? 0)) },
              { header: "Usage logs", cell: (row) => String(row._count?.usageLogs ?? 0) },
              {
                header: "Actions",
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    <Link href={`/projects/${row.id}`} className="font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-300">
                      View
                    </Link>
                    <Link href={`/projects/${row.id}/edit`} className="font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(row.id, row.name)}
                      disabled={deleteMutation.isPending}
                      className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={projects}
          />
        </CardContent>
      </Card>
    </div>
  );
}