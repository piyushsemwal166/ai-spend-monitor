import { apiClient } from "@/lib/api-client";

export interface UsageLogRecord {
  id: string;
  projectId: string;
  model: string;
  provider: "GEMINI" | "OPENAI" | "ANTHROPIC" | "GOOGLE" | "AZURE";
  tokens: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  requestCount: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    organization?: { id: string; name: string; slug: string };
  };
}

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

interface UsageLogsEnvelope {
  items: UsageLogRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalSpend: number;
    totalRequests: number;
    totalTokens: number;
  };
}

export interface UsageLogQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  projectId?: string;
}

export const usageLogService = {
  getUsageLogs: async (query?: UsageLogQuery) => {
    const response = await apiClient.get<ApiEnvelope<UsageLogsEnvelope>>("/usage-logs", { params: query });
    return response.data.data;
  },
  getUsageByProject: async (projectId: string) => {
    const response = await apiClient.get<ApiEnvelope<UsageLogsEnvelope>>("/usage-logs", {
      params: { projectId, limit: 100 },
    });
    return response.data.data;
  },
  getUsageLogById: async (id: string) => {
    const response = await apiClient.get<ApiEnvelope<UsageLogRecord>>(`/usage-logs/${id}`);
    return response.data.data;
  },
  getUsageSummary: async () => {
    const response = await apiClient.get<ApiEnvelope<{ todaySpend: number; monthlySpend: number; remainingBudget: number; totalProjects: number }>>("/dashboard/summary");
    return response.data.data;
  },
};