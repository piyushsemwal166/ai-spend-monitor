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
import { organizationService } from "@/services/organizationService";
import { organizationBudgetService, type OrganizationBudgetRow } from "@/services/organizationBudgetService";

const updateOrganizationBudgetSchema = z.object({
  organizationId: z.string().min(1, "Select an organization."),
  monthlyBudget: z.coerce.number().positive("Enter a valid monthly budget."),
  alertThreshold: z.coerce.number().int().min(1).max(100),
});

type UpdateOrganizationBudgetValues = z.infer<typeof updateOrganizationBudgetSchema>;

type OrganizationOption = {
  id: string;
  name: string;
};

export default function EditOrganizationBudgetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const budgetId = params.id;

  const budgetQuery = useQuery({
    queryKey: ["organization-budget", budgetId],
    queryFn: () => organizationBudgetService.getOrganizationBudgetById(budgetId),
    enabled: Boolean(user) && Boolean(budgetId),
  });

  const organizationsQuery = useQuery({
    queryKey: ["organizations", "organization-budget-edit"],
    queryFn: () => organizationService.getOrganizations({ limit: 1000, sortBy: "name", sortOrder: "asc" }),
    enabled: Boolean(user),
  });

  const form = useForm<UpdateOrganizationBudgetValues>({
    resolver: zodResolver(updateOrganizationBudgetSchema),
    defaultValues: { organizationId: "", monthlyBudget: 0, alertThreshold: 80 },
  });

  useEffect(() => {
    const budget = budgetQuery.data as OrganizationBudgetRow | undefined;
    if (budget) {
      form.reset({ organizationId: budget.organizationId, monthlyBudget: Number(budget.monthlyBudget), alertThreshold: budget.alertThreshold });
    }
  }, [budgetQuery.data, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateOrganizationBudgetValues) =>
      organizationBudgetService.updateOrganizationBudget(budgetId, { organizationId: values.organizationId, monthlyBudget: values.monthlyBudget, alertThreshold: values.alertThreshold }),
    onSuccess: async (updatedBudget) => {
      queryClient.setQueryData(["organization-budget", budgetId], updatedBudget);
      await queryClient.invalidateQueries({ queryKey: ["organization-budget", budgetId] });
      await queryClient.invalidateQueries({ queryKey: ["organization-budgets"] });
      toast.success("Organization budget updated successfully.");
      router.push("/organization-budgets");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => organizationBudgetService.deleteOrganizationBudget(budgetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization-budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["organization-budget", budgetId] });
      toast.success("Organization budget deleted.");
      router.push("/organization-budgets");
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    toast.promise(updateMutation.mutateAsync(values), {
      loading: "Saving organization budget...",
      success: "Organization budget saved.",
      error: (error) => (error instanceof Error ? error.message : "Unable to update organization budget."),
    }),
  );

  const handleDelete = async () => {
    if (!window.confirm("Delete this organization budget?")) {
      return;
    }

    await toast.promise(deleteMutation.mutateAsync(), {
      loading: "Deleting organization budget...",
      success: "Organization budget deleted.",
      error: (error) => (error instanceof Error ? error.message : "Unable to delete organization budget."),
    });
  };

  if (isAuthLoading || budgetQuery.isLoading || organizationsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to edit organization budgets" description="Organization budget changes require an authenticated session." actionLabel="Go to login" />;
  }

  const budget = budgetQuery.data as OrganizationBudgetRow | undefined;
  const organizations = (organizationsQuery.data?.items ?? []) as unknown as OrganizationOption[];

  if (budgetQuery.isError || !budget) {
    return <EmptyState title="Organization budget not found" description="The budget may have been deleted or you may not have access to it." actionLabel="Back to organization budgets" actionHref="/organization-budgets" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Budgets"
        title={`Edit organization budget for ${budget.organization?.name ?? budget.organizationId}`}
        description="Adjust the monthly limit and alert threshold. Remaining budget is recalculated by the backend."
        actions={<Link href="/organization-budgets" className={buttonClassName({ variant: "secondary" })}>Back to list</Link>}
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Organization" error={form.formState.errors.organizationId?.message}>
                <Select {...form.register("organizationId")}>
                  <option value="">Select an organization</option>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Monthly budget" error={form.formState.errors.monthlyBudget?.message}>
                <Input type="number" step="0.01" placeholder="100000" {...form.register("monthlyBudget")} />
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
              <Link href="/organization-budgets" className={buttonClassName({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
