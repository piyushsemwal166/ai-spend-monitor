"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { organizationService } from "@/services/organizationService";
import { apiKeyService, type ApiKeyRecord } from "@/services/apiKeyService";
import { useAuth } from "@/providers/auth-provider";

type OrganizationRow = {
  id: string;
  name: string;
  slug?: string | null;
};

export default function ApiKeysPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [organizationId, setOrganizationId] = useState("");
  const [keyValue, setKeyValue] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["api-key-organizations"],
    queryFn: () => organizationService.getOrganizations({ limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: Boolean(user),
  });

  const organizations = (organizationsQuery.data?.items ?? []) as unknown as OrganizationRow[];

  useEffect(() => {
    if (!organizationId && organizations.length > 0) {
      setOrganizationId(organizations[0].id);
    }
  }, [organizationId, organizations]);

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys", organizationId],
    queryFn: () => apiKeyService.getApiKeys({ organizationId }),
    enabled: Boolean(user) && Boolean(organizationId),
  });

  const existingKey = useMemo(() => apiKeysQuery.data?.[0] ?? null, [apiKeysQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existingKey) {
        return apiKeyService.updateApiKey(existingKey.id, { key: keyValue });
      }

      return apiKeyService.createApiKey({ organizationId, provider: "GEMINI", key: keyValue });
    },
    onSuccess: async () => {
      setKeyValue("");
      await queryClient.invalidateQueries({ queryKey: ["api-keys", organizationId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiKeyService.deleteApiKey(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["api-keys", organizationId] });
    },
  });

  const submit = async () => {
    if (!organizationId) {
      toast.error("Choose an organization first.");
      return;
    }

    if (!keyValue.trim()) {
      toast.error("Enter a Gemini API key.");
      return;
    }

    await toast.promise(saveMutation.mutateAsync(), {
      loading: existingKey ? "Updating API key..." : "Saving API key...",
      success: existingKey ? "API key updated." : "API key saved.",
      error: (error) => (error instanceof Error ? error.message : "Unable to save API key."),
    });
  };

  if (isAuthLoading || organizationsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to manage API keys" description="Organization API keys are protected by workspace access." actionLabel="Go to login" />;
  }

  if (organizations.length === 0) {
    return <EmptyState title="No organizations found" description="Create an organization before adding a Gemini API key." actionLabel="Create organization" />;
  }

  const selectedOrganization = organizations.find((organization) => organization.id === organizationId);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Settings"
        title="Gemini API keys"
        description="Store encrypted Gemini keys per organization so requests can be sent securely from the backend."
      />

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Workspace key</CardTitle>
            <CardDescription>Pick an organization and save the Gemini key used by its projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField label="Organization">
              <Select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Gemini API key">
              <Input type="password" autoComplete="off" placeholder={existingKey ? "Enter a replacement key" : "Paste your Gemini API key"} value={keyValue} onChange={(event) => setKeyValue(event.target.value)} />
            </FormField>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={() => void submit()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {existingKey ? "Update key" : "Save key"}
              </Button>
              {selectedOrganization ? <p className="text-sm text-slate-500 dark:text-slate-400">Managing {selectedOrganization.name}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Stored keys</CardTitle>
            <CardDescription>Keys are encrypted at rest and never shown after save.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKeysQuery.isLoading ? <LoadingSpinner /> : null}
            {(apiKeysQuery.data ?? []).length === 0 ? (
              <EmptyState title="No API key saved" description="Add the organization's Gemini key to start sending prompts from the playground." actionLabel="Add key" />
            ) : (
              ((apiKeysQuery.data ?? []) as unknown as ApiKeyRecord[]).map((apiKey) => (
                <div key={apiKey.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-950 dark:text-white">{apiKey.organization.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{apiKey.provider}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Created {new Date(apiKey.createdAt).toLocaleString()}</p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => void deleteMutation.mutateAsync(apiKey.id)} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}