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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import { organizationService } from "@/services/organizationService";

const updateOrganizationSchema = z.object({
	name: z.string().trim().min(2, "Enter an organization name."),
	description: z.string().trim().max(500).optional().or(z.literal("")),
});

type UpdateOrganizationValues = z.infer<typeof updateOrganizationSchema>;

type OrganizationRow = {
	id: string;
	name: string;
	slug: string | null;
	description: string | null;
	updatedAt: string;
	_count?: { members: number; projects: number };
};

export default function EditOrganizationPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { user, isLoading: isAuthLoading } = useAuth();
	const organizationId = params.id;

	const organizationQuery = useQuery({
		queryKey: ["organization", organizationId],
		queryFn: () => organizationService.getOrganizationById(organizationId),
		enabled: Boolean(user) && Boolean(organizationId),
	});

	const form = useForm<UpdateOrganizationValues>({
		resolver: zodResolver(updateOrganizationSchema),
		defaultValues: { name: "", description: "" },
	});

	useEffect(() => {
		const organization = organizationQuery.data as OrganizationRow | undefined;
		if (organization) {
			form.reset({
				name: organization.name,
				description: organization.description ?? "",
			});
		}
	}, [form, organizationQuery.data]);

	const updateMutation = useMutation({
		mutationFn: async (values: UpdateOrganizationValues) =>
			organizationService.updateOrganization(organizationId, {
				name: values.name,
				description: values.description || undefined,
			}),
		onSuccess: async (updatedOrganization) => {
			queryClient.setQueryData(["organization", organizationId], updatedOrganization);
			await queryClient.invalidateQueries({ queryKey: ["organization", organizationId] });
			await queryClient.invalidateQueries({ queryKey: ["organizations"] });
			toast.success("Organization updated successfully.");
			router.push(`/organizations/${organizationId}`);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => organizationService.deleteOrganization(organizationId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["organizations"] });
			await queryClient.invalidateQueries({ queryKey: ["organization", organizationId] });
			toast.success("Organization deleted.");
			router.push("/organizations");
		},
	});

	const onSubmit = form.handleSubmit((values) =>
		toast.promise(updateMutation.mutateAsync(values), {
			loading: "Saving organization...",
			success: "Organization saved.",
			error: (error) => (error instanceof Error ? error.message : "Unable to update organization."),
		}),
	);

	const handleDelete = async () => {
		if (!window.confirm("Delete this organization? This will remove its projects, budgets, and usage logs.")) {
			return;
		}

		await toast.promise(deleteMutation.mutateAsync(), {
			loading: "Deleting organization...",
			success: "Organization deleted.",
			error: (error) => (error instanceof Error ? error.message : "Unable to delete organization."),
		});
	};

	if (isAuthLoading || organizationQuery.isLoading) {
		return <LoadingSpinner />;
	}

	if (!user) {
		return <EmptyState title="Sign in to edit organizations" description="Organization changes require an authenticated session." actionLabel="Go to login" />;
	}

	const organization = organizationQuery.data as OrganizationRow | undefined;

	if (organizationQuery.isError || !organization) {
		return (
			<EmptyState
				title="Organization not found"
				description="The organization may have been deleted or you may not have access to it."
				actionLabel="Back to organizations"
			/>
		);
	}

	return (
		<div className="space-y-8 pb-10">
			<PageHeader
				eyebrow="Organizations"
				title={`Edit ${organization.name}`}
				description="Update the organization metadata that anchors projects, budgets, and usage analytics."
				actions={
					<Link href={`/organizations/${organization.id}`} className={buttonClassName({ variant: "secondary" })}>
						Back to organization
					</Link>
				}
			/>

			<Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
				<CardContent className="space-y-6 p-6">
					<form className="space-y-6" onSubmit={onSubmit}>
						<div className="grid gap-5 md:grid-cols-2">
							<FormField label="Organization name" error={form.formState.errors.name?.message}>
								<Input placeholder="Northstar AI" {...form.register("name")} />
							</FormField>

							<FormField label="Slug">
								<Input value={organization.slug ?? "-"} disabled readOnly />
							</FormField>
						</div>

						<FormField label="Description" error={form.formState.errors.description?.message}>
							<Textarea placeholder="Add governance notes, billing instructions, or onboarding details." {...form.register("description")} />
						</FormField>

						<div className="flex flex-wrap gap-3">
							<Button type="submit" disabled={form.formState.isSubmitting || updateMutation.isPending}>
								{form.formState.isSubmitting || updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
								Save changes
							</Button>
							<Button type="button" variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
								{deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
								Delete organization
							</Button>
							<Link href={`/organizations/${organization.id}`} className={buttonClassName({ variant: "outline" })}>
								Cancel
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
