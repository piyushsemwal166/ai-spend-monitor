"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { teamService, type TeamRecord } from "@/services/teamService";
import { formatDate } from "@/lib/format";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [page, setPage] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setTeams([]);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await teamService.getTeams({ page: page.page, limit: page.limit, search: search || undefined, sortBy: "updatedAt", sortOrder: "desc" });
        setTeams(response.items as TeamRecord[]);
        setPage(response.meta);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [page.page, page.limit, search, user]);

  const deleteMutation = useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeam(teamId),
    onSuccess: async () => {
      const response = await teamService.getTeams({ page: page.page, limit: page.limit, search: search || undefined, sortBy: "updatedAt", sortOrder: "desc" });
      setTeams(response.items as TeamRecord[]);
      setPage(response.meta);
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const handleSearch = () => {
    setIsLoading(true);
    setPage((current) => ({ ...current, page: 1 }));
    setSearch(searchInput.trim());
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await toast.promise(deleteMutation.mutateAsync(id), {
      loading: "Deleting team...",
      success: "Team deleted.",
      error: (error) => (error instanceof Error ? error.message : "Unable to delete team."),
    });
  };

  if (isAuthLoading || isLoading) return <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Loading teams...</p>;
  if (!user) return <EmptyState title="Sign in to view teams" description="Your teams are hidden until you authenticate." actionLabel="Go to login" />;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Teams"
        title="Organize users into operating teams."
        description="Create teams, assign members, and track team-level accountability."
        actions={
          <Link href="/teams/create" className={buttonClassName({ variant: "primary" })}>
            <Plus className="h-4 w-4" />
            Create Team
          </Link>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search teams" />
          <Button type="button" variant="secondary" onClick={handleSearch} className="w-full sm:w-auto">Search</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Page {page.page} of {page.totalPages || 1}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => ({ ...current, page: Math.max(1, current.page - 1) }))} disabled={page.page <= 1}>Previous</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => ({ ...current, page: Math.min(current.totalPages || 1, current.page + 1) }))} disabled={page.page >= (page.totalPages || 1)}>Next</Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
        <CardContent className="p-4 sm:p-6">
          <DataTable<TeamRecord>
            rowKey={(row) => row.id}
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Organization", cell: (row) => row.organization?.name ?? "-" },
              { header: "Members", cell: (row) => String(row._count?.members ?? row.members?.length ?? 0) },
              { header: "Created", cell: (row) => formatDate(row.createdAt) },
              {
                header: "Actions",
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    <Link href={`/teams/${row.id}`} className="font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-300">Open</Link>
                    <Link href={`/teams/${row.id}/edit`} className="font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"><Pencil className="h-4 w-4" /></Link>
                    <button type="button" onClick={() => void handleDelete(row.id, row.name)} disabled={deleteMutation.isPending} className="inline-flex items-center gap-1 font-medium text-rose-600 hover:text-rose-500 dark:text-rose-300">
                      {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={teams}
          />
        </CardContent>
      </Card>
    </div>
  );
}
