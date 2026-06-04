"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Users2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { buttonClassName } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { teamService, type TeamRecord } from "@/services/teamService";
import { formatDate } from "@/lib/format";

export default function TeamDetailPage() {
  const params = useParams<{ id: string }>();
  const teamId = params.id;
  const { user, isLoading: isAuthLoading } = useAuth();

  const teamQuery = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => teamService.getTeamById(teamId),
    enabled: Boolean(teamId) && Boolean(user),
  });

  const team = teamQuery.data as TeamRecord | undefined;

  if (isAuthLoading || teamQuery.isLoading) return <LoadingSpinner />;
  if (!user) return <EmptyState title="Sign in to view teams" description="Team details are hidden until you authenticate." actionLabel="Go to login" />;
  if (teamQuery.isError || !team) return <EmptyState title="Team not found" description="The team may have been deleted or you may not have access to it." actionLabel="Back to teams" />;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Teams"
        title={team.name}
        description="Team ownership, membership, and accountability overview."
        actions={<Link href={`/teams/${team.id}/edit`} className={buttonClassName({ variant: "secondary" })}>Edit team</Link>}
      />

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="p-6"><p className="text-sm text-slate-500 dark:text-slate-400">Organization</p><p className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">{team.organization?.name ?? "-"}</p></CardContent></Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="p-6"><p className="text-sm text-slate-500 dark:text-slate-400">Members</p><p className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">{team._count?.members ?? team.members?.length ?? 0}</p></CardContent></Card>
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="p-6"><p className="text-sm text-slate-500 dark:text-slate-400">Created</p><p className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">{formatDate(team.createdAt)}</p></CardContent></Card>
      </section>

      <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
        <CardContent className="p-6">
          <DataTable<any>
            rowKey={(row) => row.id}
            columns={[
              { header: "Name", cell: (row) => row.user?.name ?? "-" },
              { header: "Email", cell: (row) => row.user?.email ?? "-" },
              { header: "Role", cell: (row) => <Badge variant={row.role === "OWNER" ? "success" : "default"}>{row.role}</Badge> },
              { header: "Created", cell: (row) => formatDate(row.createdAt) },
            ]}
            data={team.members ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
