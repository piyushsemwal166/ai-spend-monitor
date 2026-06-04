import { apiClient } from "@/lib/api-client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AnalyticsOverview {
  totalSpend: number;
  totalRequests: number;
  totalTokens: number;
  activeUsers: number;
  activeProjects: number;
}

export interface RankedUser {
  user: { id: string; name: string; email: string };
  totalSpend: number;
  totalRequests: number;
  totalTokens: number;
}

export interface RankedTeam {
  team: { id: string | null; name: string };
  totalSpend: number;
  totalRequests: number;
  totalTokens: number;
}

export interface RankedProject {
  project: { id: string; name: string };
  totalSpend: number;
  totalRequests: number;
  totalTokens: number;
}

export interface ModelAnalyticsRow {
  model: string;
  totalUsage: number;
  totalSpend: number;
  tokenCount: number;
}

export interface ProjectAnalytics {
  spend: number;
  requests: number;
  tokens: number;
  dailyRequests: Array<{ date: string; requests: number }>;
  dailyCost: Array<{ date: string; spend: number }>;
  modelUsage: Array<{ model: string; usage: number; spend: number; tokens: number }>;
}

export const analyticsService = {
  getOverview: async () => {
    const response = await apiClient.get<ApiEnvelope<AnalyticsOverview>>("/analytics/overview");
    return response.data.data;
  },
  getTopUsers: async () => {
    const response = await apiClient.get<ApiEnvelope<RankedUser[]>>("/analytics/top-users");
    return response.data.data;
  },
  getTopTeams: async () => {
    const response = await apiClient.get<ApiEnvelope<RankedTeam[]>>("/analytics/top-teams");
    return response.data.data;
  },
  getTopProjects: async () => {
    const response = await apiClient.get<ApiEnvelope<RankedProject[]>>("/analytics/top-projects");
    return response.data.data;
  },
  getModels: async () => {
    const response = await apiClient.get<ApiEnvelope<ModelAnalyticsRow[]>>("/analytics/models");
    return response.data.data;
  },
  getProjectAnalytics: async (projectId: string) => {
    const response = await apiClient.get<ApiEnvelope<ProjectAnalytics>>(`/projects/${projectId}/analytics`);
    return response.data.data;
  },
};
