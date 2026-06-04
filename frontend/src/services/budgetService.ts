import { apiClient } from "@/lib/api-client";
import type { Budget } from "@/types";

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

export interface BudgetQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  organizationId?: string;
}

export const budgetService = {
  getBudgets: async (query?: BudgetQuery) => {
    const response = await apiClient.get<ApiEnvelope<PaginatedEnvelope<Budget>>>('/budgets', { params: query });
    return response.data.data;
  },
  getBudgetById: async (id: string) => {
    const response = await apiClient.get<ApiEnvelope<Budget>>(`/budgets/${id}`);
    return response.data.data;
  },
  createBudget: async (payload: { projectId: string; monthlyBudget: number; alertThreshold?: number }) => {
    const response = await apiClient.post<ApiEnvelope<Budget>>("/budgets", payload);
    return response.data.data;
  },
  updateBudget: async (id: string, payload: { projectId?: string; monthlyBudget?: number; currentSpend?: number; alertThreshold?: number }) => {
    const response = await apiClient.put<ApiEnvelope<Budget>>(`/budgets/${id}`, payload);
    return response.data.data;
  },
  deleteBudget: async (id: string) => {
    await apiClient.delete(`/budgets/${id}`);
  },
};