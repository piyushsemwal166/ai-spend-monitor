"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";
import { teamService } from "@/services/teamService";
import { teamBudgetService, type TeamBudgetRow } from "@/services/teamBudgetService";

const updateTeamBudgetSchema = z.object({
  teamId: z.string().min(1, "Select a team."),
  monthlyBudget: z.coerce.number().positive("Enter a valid monthly budget."),
  alertThreshold: z.coerce.number().int().min(1).max(100),
});

type UpdateTeamBudgetValues = z.infer<typeof updateTeamBudgetSchema>;

type TeamOption = {
  id: string;
  name: string;
  organization?: { id: string; name: string; slug: string };
};

export default function EditTeamBudgetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const budgetId = params.id;

  const budgetQuery = useQuery({
    queryKey: ["team-budget", budgetId],
    queryFn: () => teamBudgetService.getTeamBudgetById(budgetId),
    enabled: Boolean(user) && Boolean(budgetId),
  });

  const teamsQuery = useQuery({
    queryKey: ["teams", "team-budget-edit"],
    queryFn: () => teamService.getTeams({ limit: 1000, sortBy: "name", sortOrder: "asc" }),
    enabled: Boolean(user),
  });

  const form = useForm<UpdateTeamBudgetValues>({
    resolver: zodResolver(updateTeamBudgetSchema),
    defaultValues: { teamId: "", monthlyBudget: 0, alertThreshold: 80 },
  });

  useEffect(() => {
    const budget = budgetQuery.data as TeamBudgetRow | undefined;
    if (budget) {
      form.reset({ teamId: budget.teamId, monthlyBudget: Number(budget.monthlyBudget), alertThreshold: budget.alertThreshold });
    }
  }, [budgetQuery.data, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateTeamBudgetValues) =>
      teamBudgetService.updateTeamBudget(budgetId, { teamId: values.teamId, monthlyBudget: values.monthlyBudget, alertThreshold: values.alertThreshold }),
    onSuccess: async (updatedBudget) => {
      queryClient.setQueryData(["team-budget", budgetId], updatedBudget);
      await queryClient.invalidateQueries({ queryKey: ["team-budget", budgetId] });
      await queryClient.invalidateQueries({ queryKey: ["team-budgets"] });
      toast.success("Team budget updated successfully.");
      router.push("/team-budgets");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => teamBudgetService.deleteTeamBudget(budgetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["team-budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["team-budget", budgetId] });
      toast.success("Team budget deleted.");
      router.push("/team-budgets");
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    toast.promise(updateMutation.mutateAsync(values), {
      loading: "Saving team budget...",
      success: "Team budget saved.",
      error: (error) => (error instanceof Error ? error.message : "Unable to update team budget."),
    }),
  );

  const handleDelete = async () => {
    if (!window.confirm("Delete this team budget?")) {
      return;
    }

    await toast.promise(deleteMutation.mutateAsync(), {
      loading: "Deleting team budget...",
      success: "Team budget deleted.",
      error: (error) => (error instanceof Error ? error.message : "Unable to delete team budget."),
    });
  };

  if (isAuthLoading || budgetQuery.isLoading || teamsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to edit team budgets" description="Team budget changes require an authenticated session." actionLabel="Go to login" />;
  }

  const budget = budgetQuery.data as TeamBudgetRow | undefined;
  const teams = (teamsQuery.data?.items ?? []) as unknown as TeamOption[];

  if (budgetQuery.isError || !budget) {
    return <EmptyState title="Team budget not found" description="The budget may have been deleted or you may not have access to it." actionLabel="Back to team budgets" actionHref="/team-budgets" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Budgets"
        title={`Edit team budget for ${budget.team?.name ?? budget.teamId}`}
        description="Adjust the monthly limit and alert threshold. Remaining budget is recalculated by the backend."
        actions={<Link href="/team-budgets" className={buttonClassName({ variant: "secondary" })}>Back to list</Link>}
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Team" error={form.formState.errors.teamId?.message}>
                <Select {...form.register("teamId")}>
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.organization ? `(${team.organization.name})` : ""}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Monthly budget" error={form.formState.errors.monthlyBudget?.message}>
                <Input type="number" step="0.01" placeholder="30000" {...form.register("monthlyBudget")} />
              </FormField>

              <FormField label="Alert threshold" error={form.formState.errors.alertThreshold?.message}>
                <Input type="number" min={1} max={100} placeholder="80" {...form.register("alertThreshold")} />
              </FormField>

              <FormField label="Current spend">
                <Input value={formatCurrency(Number(budget.currentSpend ?? 0))} disabled readOnly />
              </FormField>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Remaining budget">
                <Input value={formatCurrency(Number(budget.remainingBudget ?? 0))} disabled readOnly />
              </FormField>

              <FormField label="Budget utilization">
                <Input value={`${Number(budget.monthlyBudget ?? 0) > 0 ? Math.round((Number(budget.currentSpend ?? 0) / Number(budget.monthlyBudget ?? 0)) * 100) : 0}%`} disabled readOnly />
              </FormField>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={form.formState.isSubmitting || updateMutation.isPending}>
                {form.formState.isSubmitting || updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Delete budget
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
