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
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";
import { projectService } from "@/services/projectService";

const updateProjectSchema = z.object({
  name: z.string().trim().min(2, "Enter a project name."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]),
});

type UpdateProjectValues = z.infer<typeof updateProjectSchema>;

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  organization?: { id: string; name: string; slug: string } | null;
  budget?: {
    monthlyBudget: string | number;
    currentSpend: string | number;
    remainingBudget: string | number;
  } | null;
};

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const projectId = params.id;

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: Boolean(user) && Boolean(projectId),
  });

  const form = useForm<UpdateProjectValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    const project = projectQuery.data as ProjectRow | undefined;
    if (project) {
      form.reset({
        name: project.name,
        description: project.description ?? "",
        status: project.status,
      });
    }
  }, [form, projectQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateProjectValues) =>
      projectService.updateProject(projectId, {
        name: values.name,
        description: values.description || undefined,
        status: values.status,
      }),
    onSuccess: async (updatedProject) => {
      queryClient.setQueryData(["project", projectId], updatedProject);
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully.");
      router.push(`/projects/${projectId}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectService.deleteProject(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Project deleted.");
      router.push("/projects");
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    toast.promise(updateMutation.mutateAsync(values), {
      loading: "Saving project...",
      success: "Project saved.",
      error: (error) => (error instanceof Error ? error.message : "Unable to update project."),
    }),
  );

  const handleDelete = async () => {
    if (!window.confirm("Delete this project? This will remove its budget and usage logs.")) {
      return;
    }

    await toast.promise(deleteMutation.mutateAsync(), {
      loading: "Deleting project...",
      success: "Project deleted.",
      error: (error) => (error instanceof Error ? error.message : "Unable to delete project."),
    });
  };

  if (isAuthLoading || projectQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to edit projects" description="Project changes require an authenticated session." actionLabel="Go to login" />;
  }

  const project = projectQuery.data as ProjectRow | undefined;

  if (projectQuery.isError || !project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project may have been deleted or you may not have access to it."
        actionLabel="Back to projects"
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Projects"
        title={`Edit ${project.name}`}
        description="Adjust project metadata and status. Budgets and usage logs continue to use the live backend."
        actions={
          <Link href={`/projects/${project.id}`} className={buttonClassName({ variant: "secondary" })}>
            Back to project
          </Link>
        }
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Project name" error={form.formState.errors.name?.message}>
                <Input placeholder="Customer Support Copilot" {...form.register("name")} />
              </FormField>

              <FormField label="Organization">
                <Input value={project.organization?.name ?? "-"} disabled readOnly />
              </FormField>

              <FormField label="Status" error={form.formState.errors.status?.message}>
                <Select {...form.register("status")}>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </FormField>

              <FormField label="Budget snapshot">
                <Input value={formatCurrency(Number(project.budget?.monthlyBudget ?? 0))} disabled readOnly />
              </FormField>
            </div>

            <FormField label="Description" error={form.formState.errors.description?.message}>
              <Textarea placeholder="Describe the project purpose, expected usage, and guardrails." {...form.register("description")} />
            </FormField>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={form.formState.isSubmitting || updateMutation.isPending}>
                {form.formState.isSubmitting || updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Delete project
              </Button>
              <Link href={`/projects/${project.id}`} className={buttonClassName({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}