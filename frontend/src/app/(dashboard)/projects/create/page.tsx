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
import { organizationService } from "@/services/organizationService";
import { projectService } from "@/services/projectService";

const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Enter a project name."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  organizationId: z.string().min(1, "Select an organization."),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]),
});

type CreateProjectValues = z.infer<typeof createProjectSchema>;

type OrganizationOption = {
  id: string;
  name: string;
};

export default function CreateProjectPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      organizationId: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const response = await organizationService.getOrganizations();
        setOrganizations(response.items.map((organization) => ({ id: organization.id, name: organization.name })));
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    void loadOrganizations();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    const project = await toast.promise(
      projectService.createProject({
        name: values.name,
        description: values.description || undefined,
        organizationId: values.organizationId,
        status: values.status,
      }),
      {
        loading: "Creating project...",
        success: "Project saved to PostgreSQL.",
        error: "Unable to create project.",
      },
    );

    router.push("/projects");
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Projects"
        title="Create a project"
        description="Define scope, provider, and initial budget control for a new AI workflow."
        actions={
          <Link href="/projects" className={buttonClassName({ variant: "secondary" })}>
            Back to list
          </Link>
        }
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Project name" error={errors.name?.message}>
                <Input placeholder="Customer Support Copilot" {...register("name")} />
              </FormField>

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

              <FormField label="Status" error={errors.status?.message}>
                <Select {...register("status")}>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </FormField>

              <FormField label="Description" error={errors.description?.message}>
                <Textarea placeholder="Describe the project purpose, expected usage, and guardrails." {...register("description")} />
              </FormField>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create project
              </Button>
              <Link href="/projects" className={buttonClassName({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}