import { apiClient } from "@/lib/api-client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedEnvelope<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface GatewayLogsEnvelope {
  items: GatewayLogRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalSpend: number;
    totalCount: number;
    successCount: number;
    successRate: number;
  };
}

export interface GatewayUsageSummary {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface GatewayChatResponse {
  message: string;
  usage: GatewayUsageSummary;
  estimatedCost: number;
  latency: number;
}

export interface GatewayOverviewProviderRow {
  provider: string;
  requests: number;
  totalSpend: number;
  averageLatency: number;
}

export interface GatewayOverview {
  totalRequests: number;
  averageCost: number;
  averageLatency: number;
  providerUsage: GatewayOverviewProviderRow[];
}

export interface GatewayLogRecord {
  id: string;
  userId: string | null;
  teamId: string | null;
  projectId: string;
  provider: string;
  model: string;
  latency: number;
  status: "SUCCESS" | "BLOCKED" | "FAILED";
  estimatedCost: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
  team?: { id: string; name: string } | null;
  project?: { id: string; name: string; organization?: { id: string; name: string; slug: string } } | null;
}

export interface GatewayLogsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  projectId?: string;
  provider?: string;
  status?: "SUCCESS" | "BLOCKED" | "FAILED";
}

export interface ProjectGatewayAnalytics {
  totalRequests: number;
  averageCost: number;
  averageLatency: number;
  totalSpend: number;
  requestHistory: GatewayLogRecord[];
  providerUsage: GatewayOverviewProviderRow[];
  costHistory: Array<{ date: string; cost: number }>;
  latencyHistory: Array<{ date: string; latency: number }>;
}

export const gatewayService = {
  chat: async (payload: { projectId: string; provider?: "GEMINI" | "OPENAI"; model: string; prompt: string }) => {
    const response = await apiClient.post<ApiEnvelope<GatewayChatResponse>>("/gateway/chat", payload);
    return response.data.data;
  },
  getOverview: async () => {
    const response = await apiClient.get<ApiEnvelope<GatewayOverview>>("/gateway/overview");
    return response.data.data;
  },
  getLogs: async (query?: GatewayLogsQuery) => {
    const response = await apiClient.get<ApiEnvelope<GatewayLogsEnvelope>>("/gateway/logs", { params: query });
    return response.data.data;
  },
  getProjectGateway: async (projectId: string) => {
    const response = await apiClient.get<ApiEnvelope<ProjectGatewayAnalytics>>(`/projects/${projectId}/gateway`);
    return response.data.data;
  },
};
