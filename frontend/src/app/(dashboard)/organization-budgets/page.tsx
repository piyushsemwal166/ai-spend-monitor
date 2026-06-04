"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Wallet, ArrowUpRight, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";
import { organizationBudgetService, type OrganizationBudgetRow } from "@/services/organizationBudgetService";

type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function OrganizationBudgetsPage() {
  const [budgets, setBudgets] = useState<OrganizationBudgetRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setIsLoading(false);
      return;
    }

    const loadBudgets = async () => {
      try {
        const response = await organizationBudgetService.getOrganizationBudgets({ page: meta.page, limit: meta.limit, search: search || undefined, sortBy: "updatedAt", sortOrder: "desc" });
        setBudgets(response.items);
        setMeta(response.meta);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBudgets();
  }, [meta.page, meta.limit, search, user]);

  const deleteMutation = useMutation({
    mutationFn: (budgetId: string) => organizationBudgetService.deleteOrganizationBudget(budgetId),
    onSuccess: async () => {
      if (user) {
        const response = await organizationBudgetService.getOrganizationBudgets({ page: meta.page, limit: meta.limit, search: search || undefined, sortBy: "updatedAt", sortOrder: "desc" });
        setBudgets(response.items);
        setMeta(response.meta);
      }
      await queryClient.invalidateQueries({ queryKey: ["organization-budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const handleDelete = async (budgetId: string, organizationName: string) => {
    if (!window.confirm(`Delete the budget for ${organizationName}?`)) {
      return;
    }

    await toast.promise(deleteMutation.mutateAsync(budgetId), {
      loading: "Deleting organization budget...",
      success: "Organization budget deleted.",
      error: (error) => (error instanceof Error ? error.message : "Unable to delete organization budget."),
    });
  };

  const handleSearch = () => {
    setIsLoading(true);
    setMeta((current) => ({ ...current, page: 1 }));
    setSearch(searchInput.trim());
  };

  if (isAuthLoading || isLoading) {
    return <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Loading organization budgets...</p>;
  }

  if (!user) {
    return <EmptyState title="Sign in to view organization budgets" description="Organization budget management is hidden until you authenticate." actionLabel="Go to login" />;
  }

  const totalLimit = budgets.reduce((sum, budget) => sum + Number(budget.monthlyBudget ?? 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.currentSpend ?? 0), 0);
  const breachedBudgets = budgets.filter((budget) => Number(budget.remainingBudget ?? 0) <= 0).length;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Budgets"
        title="Organization budgets"
        description="Keep an eye on portfolio-wide limits and overspend risk."
        actions={
          <>
            <Link href="/budgets" className={buttonClassName({ variant: "secondary" })}>
              Project budgets
            </Link>
            <Link href="/team-budgets" className={buttonClassName({ variant: "secondary" })}>
              Team budgets
            </Link>
            <Link href="/organization-budgets/create" className={buttonClassName({ variant: "primary" })}>
              <FilePlus2 className="h-4 w-4" />
              Create organization budget
            </Link>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Total limit", value: formatCurrency(totalLimit), icon: Wallet },
          { title: "Total spend", value: formatCurrency(totalSpent), icon: ArrowUpRight },
          { title: "Breached budgets", value: String(breachedBudgets), icon: ShieldAlert },
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
          <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search organization budgets" />
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
          <CardTitle>Organization budget list</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<OrganizationBudgetRow>
            rowKey={(row) => row.id}
            columns={[
              { header: "Organization", cell: (row) => row.organization?.name ?? row.organizationId },
              { header: "Slug", cell: (row) => row.organization?.slug ?? "-" },
              { header: "Limit", cell: (row) => formatCurrency(Number(row.monthlyBudget ?? 0)) },
              { header: "Spent", cell: (row) => formatCurrency(Number(row.currentSpend ?? 0)) },
              { header: "Remaining", cell: (row) => formatCurrency(Number(row.remainingBudget ?? 0)) },
              { header: "Alert threshold", cell: (row) => `${row.alertThreshold}%` },
              {
                header: "Actions",
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    <Link href={`/organization-budgets/${row.id}/edit`} className="font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-300">
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(row.id, row.organization?.name ?? row.organizationId)}
                      disabled={deleteMutation.isPending}
                      className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={budgets}
          />
        </CardContent>
      </Card>
    </div>
  );
}
