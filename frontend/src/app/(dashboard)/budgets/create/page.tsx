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
import { Textarea } from "@/components/ui/textarea";
import { projectService } from "@/services/projectService";
import { budgetService } from "@/services/budgetService";

const createBudgetSchema = z.object({
  projectId: z.string().min(1, "Select a project."),
  monthlyBudget: z.coerce.number().positive("Enter a valid monthly budget."),
  alertThreshold: z.coerce.number().int().min(1).max(100),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type CreateBudgetValues = z.infer<typeof createBudgetSchema>;

type ProjectOption = {
  id: string;
  name: string;
};

export default function CreateBudgetPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBudgetValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      projectId: "",
      monthlyBudget: 30000,
      alertThreshold: 80,
      notes: "",
    },
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectService.getProjects();
        setProjects(response.items.map((project) => ({ id: project.id, name: project.name })));
      } finally {
        setIsLoadingProjects(false);
      }
    };

    void loadProjects();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    const budget = await toast.promise(
      budgetService.createBudget({
        projectId: values.projectId,
        monthlyBudget: values.monthlyBudget,
        alertThreshold: values.alertThreshold,
      }),
      {
        loading: "Creating budget...",
        success: "Budget saved to PostgreSQL.",
        error: "Unable to create budget.",
      },
    );

    router.push("/budgets");
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Budgets"
        title="Create a budget"
        description="Set a spend limit and monitoring cadence for a team or initiative."
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
              <FormField label="Project" error={errors.projectId?.message} hint={isLoadingProjects ? "Loading..." : undefined}>
                <Select {...register("projectId")} disabled={isLoadingProjects || projects.length === 0}>
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
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

              <FormField label="Notes" error={errors.notes?.message}>
                <Textarea placeholder="Explain what this budget covers and who owns it." {...register("notes")} />
              </FormField>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create budget
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