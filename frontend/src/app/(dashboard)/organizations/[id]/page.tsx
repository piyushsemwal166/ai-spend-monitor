"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Building2, Users2, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/providers/auth-provider";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { organizationService } from "@/services/organizationService";
import { projectService } from "@/services/projectService";
import { usageLogService } from "@/services/usageLogService";
import { formatCurrency, formatDate } from "@/lib/format";

type OrganizationRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  updatedAt: string;
  _count?: { members: number; projects: number };
};

export default function OrganizationDetailPage() {
  const params = useParams<{ id: string }>();
  const organizationId = params.id;
  const { user, isLoading: isAuthLoading } = useAuth();

  const organizationQuery = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => organizationService.getOrganizationById(organizationId),
    enabled: Boolean(organizationId) && Boolean(user),
  });

  const projectsQuery = useQuery({
    queryKey: ["organization-projects", organizationId],
    queryFn: () => projectService.getProjects(),
    enabled: Boolean(organizationId) && Boolean(user),
  });

  const usageLogsQuery = useQuery({
    queryKey: ["organization-usage-logs", organizationId],
    queryFn: () => usageLogService.getUsageLogs({ limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: Boolean(organizationId) && Boolean(user),
  });

  const organization = organizationQuery.data as OrganizationRow | undefined;
  const organizationProjects = useMemo(
    () => (projectsQuery.data?.items ?? []).filter((project: any) => project.organization?.id === organizationId),
    [projectsQuery.data, organizationId],
  );
  const organizationLogs = useMemo(
    () => (usageLogsQuery.data?.items ?? []).filter((log: any) => log.project?.organization?.id === organizationId),
    [usageLogsQuery.data, organizationId],
  );

  const totalSpend = organizationProjects.reduce((sum: number, project: any) => sum + Number(project.budget?.currentSpend ?? 0), 0);
  const totalBudget = organizationProjects.reduce((sum: number, project: any) => sum + Number(project.budget?.monthlyBudget ?? 0), 0);
  const utilization = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;
  const totalMembers = organization?._count?.members ?? 0;

  if (isAuthLoading || organizationQuery.isLoading || projectsQuery.isLoading || usageLogsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in to view organization details"
        description="Organization details are hidden until you authenticate."
        actionLabel="Go to login"
      />
    );
  }

  if (organizationQuery.isError || !organization) {
    return (
      <EmptyState
        title="Organization not found"
        description="The organization may have been deleted or you may not have access to it."
        actionLabel="Back to organizations"
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Organizations"
        title={organization.name}
        description="Organization overview, team structure, and spend summary."
        actions={
          <>
            <Link href="/organizations/settings" className={buttonClassName({ variant: "secondary" })}>
              Organization settings
            </Link>
            <Link href="/organizations/create" className={buttonClassName({ variant: "primary" })}>
              <Building2 className="h-4 w-4" />
              Add organization
            </Link>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Spend", value: formatCurrency(totalSpend), icon: Wallet },
          { title: "Budget utilization", value: `${utilization}%`, icon: ArrowUpRight },
          { title: "Members", value: String(totalMembers), icon: Users2 },
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

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Team information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-slate-500 dark:text-slate-400">Slug</p>
                <p className="mt-1 font-medium text-slate-950 dark:text-white">{organization.slug ?? "-"}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-slate-500 dark:text-slate-400">Projects</p>
                <p className="mt-1 font-medium text-slate-950 dark:text-white">{organization?._count?.projects ?? organizationProjects.length}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-slate-500 dark:text-slate-400">Description</p>
                <p className="mt-1 font-medium text-slate-950 dark:text-white">{organization.description ?? "-"}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-slate-500 dark:text-slate-400">Last updated</p>
                <p className="mt-1 font-medium text-slate-950 dark:text-white">{formatDate(organization.updatedAt)}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-cyan-500/15 bg-cyan-500/8 p-5 text-cyan-900 dark:text-cyan-100">
              <p className="font-medium">Governance summary</p>
              <p className="mt-2 leading-7 text-cyan-900/70 dark:text-cyan-100/75">
                This organization is within budget, with a healthy utilization rate and active project coverage across the portfolio.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Spending summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Monthly progress</span>
                <span>{utilization}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200/80 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${utilization}%` }} />
              </div>
            </div>
            <Badge variant="success">Healthy</Badge>
            <div className="space-y-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              <p>• Cost drift is contained through live monitoring.</p>
              <p>• Teams have budget accountability at project level.</p>
              <p>• Recent activity is pulled from the live API.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
        <CardHeader>
          <CardTitle>Recent usage tied to this organization</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<any>
            rowKey={(row) => row.id}
            columns={[
              { header: "Project", cell: (row) => row.project?.name ?? "-" },
              { header: "Provider", accessor: "provider" },
              { header: "Tokens", cell: (row) => String(row.tokens) },
              { header: "Cost", cell: (row) => formatCurrency(Number(row.cost)) },
              { header: "Date", cell: (row) => formatDate(String(row.createdAt)) },
            ]}
            data={organizationLogs}
          />
        </CardContent>
      </Card>
    </div>
  );
}