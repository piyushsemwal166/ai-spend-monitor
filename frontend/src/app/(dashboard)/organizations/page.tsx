"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Building2, Users2, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { organizationService } from "@/services/organizationService";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

type OrganizationRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    projects: number;
  };
};

type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setOrganizations([]);
      setIsLoading(false);
      return;
    }

    const loadOrganizations = async () => {
      try {
        const response = await organizationService.getOrganizations({ page: meta.page, limit: meta.limit, search: search || undefined, sortBy: "updatedAt", sortOrder: "desc" });
        setOrganizations(response.items as unknown as OrganizationRow[]);
        setMeta(response.meta);
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrganizations();
  }, [meta.page, meta.limit, search, user]);

  const deleteMutation = useMutation({
    mutationFn: (organizationId: string) => organizationService.deleteOrganization(organizationId),
    onSuccess: async () => {
      const response = await organizationService.getOrganizations({ page: meta.page, limit: meta.limit, search: search || undefined, sortBy: "updatedAt", sortOrder: "desc" });
      setOrganizations(response.items as unknown as OrganizationRow[]);
      setMeta(response.meta);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const handleDelete = async (organizationId: string, organizationName: string) => {
    if (!window.confirm(`Delete ${organizationName}? This removes its projects and budgets.`)) {
      return;
    }

    await toast.promise(deleteMutation.mutateAsync(organizationId), {
      loading: "Deleting organization...",
      success: "Organization deleted.",
      error: (error) => (error instanceof Error ? error.message : "Unable to delete organization."),
    });
  };

  const handleSearch = () => {
    setIsLoading(true);
    setMeta((current) => ({ ...current, page: 1 }));
    setSearch(searchInput.trim());
  };

  if (isAuthLoading || isLoading) {
    return <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Loading organizations...</p>;
  }

  if (!user) {
    return <EmptyState title="Sign in to view organizations" description="Your organization list is hidden until you authenticate." actionLabel="Go to login" />;
  }

  const totalMembers = organizations.reduce((sum, organization) => sum + (organization._count?.members ?? 0), 0);
  const totalProjects = organizations.reduce((sum, organization) => sum + (organization._count?.projects ?? 0), 0);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Organizations"
        title="Manage the business units behind every AI workload."
        description="Create organizations, inspect team coverage, and keep ownership aligned with budget control."
        actions={
          <>
            <Link href="/organizations/create" className={buttonClassName({ variant: "primary" })}>
              <Plus className="h-4 w-4" />
              Create Organization
            </Link>
            <Link href="/organizations/settings" className={buttonClassName({ variant: "secondary" })}>
              Settings
            </Link>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Total organizations", value: String(organizations.length), icon: Building2 },
          { title: "Team members", value: String(totalMembers), icon: Users2 },
          { title: "Projects", value: String(totalProjects), icon: ArrowUpRight },
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-xl gap-3">
          <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search organizations" />
          <Button type="button" variant="secondary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
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
          <CardTitle>Organization overview</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<OrganizationRow>
            rowKey={(row) => row.id}
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Slug", accessor: "slug" },
              { header: "Members", cell: (row) => String(row._count?.members ?? 0) },
              { header: "Projects", cell: (row) => String(row._count?.projects ?? 0) },
              { header: "Description", accessor: "description" },
              { header: "Updated", cell: (row) => formatDate(row.updatedAt) },
              {
                header: "Actions",
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    <Link href={`/organizations/${row.id}`} className="font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-300">
                      Open
                    </Link>
                    <Link href={`/organizations/${row.id}/edit`} className="font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                      Edit
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
            data={organizations}
          />
        </CardContent>
      </Card>
    </div>
  );
}