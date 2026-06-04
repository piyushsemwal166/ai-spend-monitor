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

export interface TeamBudgetRow {
  id: string;
  teamId: string;
  monthlyBudget: string | number;
  currentSpend: string | number;
  remainingBudget: string | number;
  alertThreshold: number;
  team?: {
    id: string;
    name: string;
    organization?: { id: string; name: string; slug: string };
  };
}

export interface TeamBudgetQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  organizationId?: string;
}

export const teamBudgetService = {
  getTeamBudgets: async (query?: TeamBudgetQuery) => {
    const response = await apiClient.get<ApiEnvelope<PaginatedEnvelope<TeamBudgetRow>>>("/team-budgets", { params: query });
    return response.data.data;
  },
  getTeamBudgetById: async (id: string) => {
    const response = await apiClient.get<ApiEnvelope<TeamBudgetRow>>(`/team-budgets/${id}`);
    return response.data.data;
  },
  createTeamBudget: async (payload: { teamId: string; monthlyBudget: number; alertThreshold?: number }) => {
    const response = await apiClient.post<ApiEnvelope<TeamBudgetRow>>("/team-budgets", payload);
    return response.data.data;
  },
  updateTeamBudget: async (id: string, payload: { teamId?: string; monthlyBudget?: number; currentSpend?: number; alertThreshold?: number }) => {
    const response = await apiClient.put<ApiEnvelope<TeamBudgetRow>>(`/team-budgets/${id}`, payload);
    return response.data.data;
  },
  deleteTeamBudget: async (id: string) => {
    await apiClient.delete(`/team-budgets/${id}`);
  },
};
