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
import { budgetService } from "@/services/budgetService";
import { projectService } from "@/services/projectService";

const updateBudgetSchema = z.object({
  projectId: z.string().min(1, "Select a project."),
  monthlyBudget: z.coerce.number().positive("Enter a valid monthly budget."),
  alertThreshold: z.coerce.number().int().min(1).max(100),
});

type UpdateBudgetValues = z.infer<typeof updateBudgetSchema>;

type BudgetRow = {
  id: string;
  projectId: string;
  monthlyBudget: string | number;
  currentSpend: string | number;
  remainingBudget: string | number;
  alertThreshold: number;
  project?: {
    id: string;
    name: string;
    organization?: { id: string; name: string; slug: string };
  };
};

type ProjectOption = {
  id: string;
  name: string;
};

export default function EditBudgetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const budgetId = params.id;

  const budgetQuery = useQuery({
    queryKey: ["budget", budgetId],
    queryFn: () => budgetService.getBudgetById(budgetId),
    enabled: Boolean(user) && Boolean(budgetId),
  });

  const projectsQuery = useQuery({
    queryKey: ["projects", "budget-edit"],
    queryFn: () => projectService.getProjects(),
    enabled: Boolean(user),
  });

  const form = useForm<UpdateBudgetValues>({
    resolver: zodResolver(updateBudgetSchema) as never,
    defaultValues: {
      projectId: "",
      monthlyBudget: 0,
      alertThreshold: 80,
    },
  });

  useEffect(() => {
    const budget = budgetQuery.data as BudgetRow | undefined;
    if (budget) {
      form.reset({
        projectId: budget.projectId,
        monthlyBudget: Number(budget.monthlyBudget),
        alertThreshold: budget.alertThreshold,
      });
    }
  }, [budgetQuery.data, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateBudgetValues) =>
      budgetService.updateBudget(budgetId, {
        projectId: values.projectId,
        monthlyBudget: values.monthlyBudget,
        alertThreshold: values.alertThreshold,
      }),
    onSuccess: async (updatedBudget) => {
      queryClient.setQueryData(["budget", budgetId], updatedBudget);
      await queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Budget updated successfully.");
      router.push("/budgets");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => budgetService.deleteBudget(budgetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Budget deleted.");
      router.push("/budgets");
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    toast.promise(updateMutation.mutateAsync(values), {
      loading: "Saving budget...",
      success: "Budget saved.",
      error: (error) => (error instanceof Error ? error.message : "Unable to update budget."),
    }),
  );

  const handleDelete = async () => {
    if (!window.confirm("Delete this budget? Spend tracking for the linked project will stop.")) {
      return;
    }

    await toast.promise(deleteMutation.mutateAsync(), {
      loading: "Deleting budget...",
      success: "Budget deleted.",
      error: (error) => (error instanceof Error ? error.message : "Unable to delete budget."),
    });
  };

  if (isAuthLoading || budgetQuery.isLoading || projectsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to edit budgets" description="Budget changes require an authenticated session." actionLabel="Go to login" />;
  }

  const budget = budgetQuery.data as BudgetRow | undefined;
  const projects = (projectsQuery.data?.items ?? []) as unknown as ProjectOption[];

  if (budgetQuery.isError || !budget) {
    return <EmptyState title="Budget not found" description="The budget may have been deleted or you may not have access to it." actionLabel="Back to budgets" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Budgets"
        title={`Edit budget for ${budget.project?.name ?? budget.projectId}`}
        description="Adjust the monthly limit and alert threshold. Remaining budget is recalculated by the backend."
        actions={
          <Link href="/budgets" className={buttonClassName({ variant: "secondary" })}>
            Back to list
          </Link>
        }
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Project" error={form.formState.errors.projectId?.message}>
                <Select {...form.register("projectId")}>
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
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
                <Input
                  value={`${
                    Number(budget.monthlyBudget ?? 0) > 0
                      ? Math.round((Number(budget.currentSpend ?? 0) / Number(budget.monthlyBudget ?? 0)) * 100)
                      : 0
                  }%`}
                  disabled
                  readOnly
                />
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
              <Link href="/budgets" className={buttonClassName({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}