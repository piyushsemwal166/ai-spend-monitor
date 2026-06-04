"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useAuth } from "@/providers/auth-provider";
import { projectService } from "@/services/projectService";
import { gatewayService } from "@/services/gatewayService";
import { formatCompactNumber, formatCurrency } from "@/lib/format";

type ProjectOption = {
  id: string;
  name: string;
  organization?: { id: string; name: string; slug: string };
};

export default function AiPlaygroundPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [projectId, setProjectId] = useState("");
  const [provider, setProvider] = useState<"GEMINI" | "OPENAI">("GEMINI");
  const [model, setModel] = useState<string>("gemini-2.5-flash");
  const [prompt, setPrompt] = useState("Summarize the last 10 usage logs for this project and flag any anomalies.");
  const [responseText, setResponseText] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["ai-playground-projects"],
    queryFn: () => projectService.getProjects({ limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: Boolean(user),
  });

  const projects = (projectsQuery.data?.items ?? []) as unknown as ProjectOption[];

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects]);

  const currentProject = useMemo(() => projects.find((project) => project.id === projectId), [projectId, projects]);

  const chatMutation = useMutation({
    mutationFn: gatewayService.chat,
    onSuccess: (data) => {
      setResponseText(data.message);
    },
  });

  const submitPrompt = async () => {
    if (!projectId) {
      toast.error("Select a project first.");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Enter a prompt.");
      return;
    }

    await toast.promise(chatMutation.mutateAsync({ projectId, provider, model, prompt }), {
      loading: "Sending prompt to the gateway...",
      success: "Gateway response captured.",
      error: (error) => (error instanceof Error ? error.message : "Unable to send prompt."),
    });
  };

  if (isAuthLoading || projectsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <EmptyState title="Sign in to use AI Playground" description="Gemini requests are available only after authentication." actionLabel="Go to login" />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects available"
        description="Create a project first, then connect a Gemini API key for its organization."
        actionLabel="Create project"
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="AI Playground"
        title="Send prompts through the AI gateway."
        description="Choose a project, send a prompt, and let the backend record tokens, latency, and estimated cost for every request."
        actions={
          <Link href="/settings/api-keys" className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-white">
            Manage API keys
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Prompt Gateway</CardTitle>
            <CardDescription>Everything here is routed through the centralized gateway endpoint.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Project">
                <Select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} {project.organization ? `• ${project.organization.name}` : ""}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Provider">
                <Select value={provider} onChange={(event) => setProvider(event.target.value as any)}>
                  <option value="GEMINI">Gemini</option>
                  <option value="OPENAI">OpenAI</option>
                </Select>
              </FormField>
              <FormField label="Model">
                <Select value={model} onChange={(event) => setModel(event.target.value)}>
                  {provider === "GEMINI" ? (
                    <>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                      <option value="gpt-4.1">gpt-4.1</option>
                      <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                    </>
                  )}
                </Select>
              </FormField>
            </div>

            <FormField label="Prompt">
              <Textarea rows={10} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask Gemini to summarize, classify, compare, or inspect usage patterns." />
            </FormField>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={() => void submitPrompt()} disabled={chatMutation.isPending}>
                {chatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send to Gateway
              </Button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Project: {currentProject?.name ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>Live response text and usage metadata are shown here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Input tokens</p>
                <p className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCompactNumber(chatMutation.data?.usage.inputTokens ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Output tokens</p>
                <p className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCompactNumber(chatMutation.data?.usage.outputTokens ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Estimated cost</p>
                <p className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCurrency(chatMutation.data?.estimatedCost ?? 0)}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
              {responseText || "The Gemini response will appear here after the first request."}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}