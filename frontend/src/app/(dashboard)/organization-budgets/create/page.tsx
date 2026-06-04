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
import { organizationService } from "@/services/organizationService";
import { organizationBudgetService } from "@/services/organizationBudgetService";

const createOrganizationBudgetSchema = z.object({
  organizationId: z.string().min(1, "Select an organization."),
  monthlyBudget: z.coerce.number().positive("Enter a valid monthly budget."),
  alertThreshold: z.coerce.number().int().min(1).max(100),
});

type CreateOrganizationBudgetValues = z.infer<typeof createOrganizationBudgetSchema>;

type OrganizationOption = {
  id: string;
  name: string;
};

export default function CreateOrganizationBudgetPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationBudgetValues>({
    resolver: zodResolver(createOrganizationBudgetSchema),
    defaultValues: { organizationId: "", monthlyBudget: 100000, alertThreshold: 80 },
  });

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const response = await organizationService.getOrganizations({ limit: 1000, sortBy: "name", sortOrder: "asc" });
        setOrganizations(response.items.map((organization) => ({ id: organization.id, name: organization.name })));
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    void loadOrganizations();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    await toast.promise(
      organizationBudgetService.createOrganizationBudget({ organizationId: values.organizationId, monthlyBudget: values.monthlyBudget, alertThreshold: values.alertThreshold }),
      { loading: "Creating organization budget...", success: "Organization budget saved.", error: "Unable to create organization budget." },
    );
    router.push("/organization-budgets");
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Budgets"
        title="Create an organization budget"
        description="Assign a portfolio-wide monthly limit and alert threshold."
        actions={<Link href="/organization-budgets" className={buttonClassName({ variant: "secondary" })}>Back to list</Link>}
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Organization" error={errors.organizationId?.message} hint={isLoadingOrganizations ? "Loading..." : undefined}>
                <Select {...register("organizationId")} disabled={isLoadingOrganizations || organizations.length === 0}>
                  <option value="">Select an organization</option>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Monthly budget" error={errors.monthlyBudget?.message}>
                <Input type="number" step="0.01" placeholder="100000" {...register("monthlyBudget")} />
              </FormField>

              <FormField label="Alert threshold" error={errors.alertThreshold?.message}>
                <Input type="number" min={1} max={100} placeholder="80" {...register("alertThreshold")} />
              </FormField>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create organization budget
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
