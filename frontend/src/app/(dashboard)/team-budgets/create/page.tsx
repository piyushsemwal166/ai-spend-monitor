"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { teamService } from "@/services/teamService";
import { teamBudgetService } from "@/services/teamBudgetService";

const createTeamBudgetSchema = z.object({
  teamId: z.string().min(1, "Select a team."),
  monthlyBudget: z.coerce.number().positive("Enter a valid monthly budget."),
  alertThreshold: z.coerce.number().int().min(1).max(100),
});

type CreateTeamBudgetValues = z.infer<typeof createTeamBudgetSchema>;

type TeamOption = {
  id: string;
  name: string;
  organization?: { id: string; name: string; slug: string };
};

export default function CreateTeamBudgetPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateTeamBudgetValues>({
    resolver: zodResolver(createTeamBudgetSchema),
    defaultValues: { teamId: "", monthlyBudget: 30000, alertThreshold: 80 },
  });

  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await teamService.getTeams({ limit: 1000, sortBy: "name", sortOrder: "asc" });
        setTeams(response.items.map((team) => ({ id: team.id, name: team.name, organization: team.organization })));
      } finally {
        setIsLoadingTeams(false);
      }
    };

    void loadTeams();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    await toast.promise(
      teamBudgetService.createTeamBudget({ teamId: values.teamId, monthlyBudget: values.monthlyBudget, alertThreshold: values.alertThreshold }),
      { loading: "Creating team budget...", success: "Team budget saved.", error: "Unable to create team budget." },
    );
    router.push("/team-budgets");
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Budgets"
        title="Create a team budget"
        description="Assign a monthly limit to a team and keep spend guardrails visible."
        actions={<Link href="/team-budgets" className={buttonClassName({ variant: "secondary" })}>Back to list</Link>}
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Team" error={errors.teamId?.message} hint={isLoadingTeams ? "Loading..." : undefined}>
                <Select {...register("teamId")} disabled={isLoadingTeams || teams.length === 0}>
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.organization ? `(${team.organization.name})` : ""}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Monthly budget" error={errors.monthlyBudget?.message}>
                <Input type="number" step="0.01" placeholder="30000" {...register("monthlyBudget")} />
              </FormField>

              <FormField label="Alert threshold" error={errors.alertThreshold?.message}>
                <Input type="number" min={1} max={100} placeholder="80" {...register("alertThreshold")} />
              </FormField>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create team budget
              </Button>
              <Link href="/team-budgets" className={buttonClassName({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
