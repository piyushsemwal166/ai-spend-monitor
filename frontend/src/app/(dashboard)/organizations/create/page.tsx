"use client";

import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import { organizationService } from "@/services/organizationService";

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Enter an organization name."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;

export default function CreateOrganizationPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const organization = await toast.promise(
      organizationService.createOrganization({
        name: values.name,
        description: values.description || undefined,
      }),
      {
        loading: "Creating organization...",
        success: "Organization saved to PostgreSQL.",
        error: "Unable to create organization.",
      },
    );

    router.push("/organizations");
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Organizations"
        title="Create a new organization."
        description="Set up ownership, billing context, and budget oversight for a new business unit."
        actions={
          <Link href="/organizations" className={buttonClassName({ variant: "secondary" })}>
            Back to list
          </Link>
        }
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField label="Organization name" error={errors.name?.message}>
              <Input placeholder="Northstar AI" {...register("name")} />
            </FormField>

            <FormField label="Description" error={errors.description?.message}>
              <Textarea placeholder="Add governance notes, billing instructions, or onboarding details." {...register("description")} />
            </FormField>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create organization
              </Button>
              <Link href="/organizations" className={buttonClassName({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}