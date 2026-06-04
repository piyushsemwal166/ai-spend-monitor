"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { TeamMemberSelector } from "@/components/teams/team-member-selector";
import { teamService } from "@/services/teamService";
import { useAuth } from "@/providers/auth-provider";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a team name."),
});

type Values = z.infer<typeof schema>;

export default function EditTeamPage() {
  const params = useParams<{ id: string }>();
  const teamId = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [lockedMemberIds, setLockedMemberIds] = useState<string[]>([]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "" } });

  useEffect(() => {
    if (!user) return;
    void teamService.getTeamById(teamId).then((team) => {
      reset({ name: team.name });
      setOrganizationId(team.organization?.id);
      setMemberIds((team.members ?? []).map((member) => member.user.id));
      setLockedMemberIds((team.members ?? []).filter((member) => member.role === "OWNER").map((member) => member.user.id));
      setLoading(false);
    });
  }, [teamId, reset, user]);

  const onSubmit = handleSubmit(async (values) => {
    await toast.promise(teamService.updateTeam(teamId, { name: values.name, memberIds }), {
      loading: "Updating team...",
      success: "Team updated.",
      error: (error) => (error instanceof Error ? error.message : "Unable to update team."),
    });
    router.push(`/teams/${teamId}`);
  });

  if (loading) return <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Loading team...</p>;
  if (!user) return null;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader eyebrow="Teams" title="Edit team." description="Update team metadata and membership." actions={<Link href="/teams" className={buttonClassName({ variant: "secondary" })}>Back to list</Link>} />
      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60"><CardContent className="space-y-6 p-6"><form className="space-y-6" onSubmit={onSubmit}><FormField label="Team name" error={errors.name?.message}><Input placeholder="Platform" {...register("name")} /></FormField><TeamMemberSelector organizationId={organizationId} selectedIds={memberIds} lockedIds={lockedMemberIds} onChange={setMemberIds} helperText="OWNER members are locked. Remove or add other users as needed." /><div className="flex flex-wrap gap-3"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save changes</Button><Link href={`/teams/${teamId}`} className={buttonClassName({ variant: "outline" })}>Cancel</Link></div></form></CardContent></Card>
    </div>
  );
}
