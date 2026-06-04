"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Select } from "@/components/ui/select";
import { TeamMemberSelector } from "@/components/teams/team-member-selector";
import { organizationService } from "@/services/organizationService";
import { teamService } from "@/services/teamService";
import { useAuth } from "@/providers/auth-provider";

const schema = z.object({
  organizationId: z.string().min(1, "Select an organization."),
  name: z.string().trim().min(2, "Enter a team name."),
});

type Values = z.infer<typeof schema>;

export default function CreateTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    void organizationService.getOrganizations({ limit: 100, sortBy: "updatedAt", sortOrder: "desc" }).then((response) => {
      setOrganizations((response.items as Array<{ id: string; name: string }>));
    });
  }, [user]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { organizationId: "", name: "" },
  });

  const organizationId = watch("organizationId");

  useEffect(() => {
    setMemberIds([]);
  }, [organizationId]);

  const onSubmit = handleSubmit(async (values) => {
    await toast.promise(
      teamService.createTeam({
        organizationId: values.organizationId,
        name: values.name,
        memberIds,
      }),
      {
        loading: "Creating team...",
        success: "Team created.",
        error: (error) => (error instanceof Error ? error.message : "Unable to create team."),
      },
    );

    router.push("/teams");
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader eyebrow="Teams" title="Create a team." description="Group users under a shared operating unit." actions={<Link href="/teams" className={buttonClassName({ variant: "secondary" })}>Back to list</Link>} />
      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField label="Organization" error={errors.organizationId?.message}>
              <Select {...register("organizationId")}>
                <option value="">Select organization</option>
                {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Team name" error={errors.name?.message}>
              <Input placeholder="Platform" {...register("name")} />
            </FormField>
            <TeamMemberSelector
              organizationId={organizationId || undefined}
              selectedIds={memberIds}
              onChange={setMemberIds}
              helperText="You will be added automatically as OWNER when the team is created."
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Create team</Button>
              <Link href="/teams" className={buttonClassName({ variant: "outline" })}>Cancel</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
