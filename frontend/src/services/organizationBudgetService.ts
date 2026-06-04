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

export interface OrganizationBudgetRow {
  id: string;
  organizationId: string;
  monthlyBudget: string | number;
  currentSpend: string | number;
  remainingBudget: string | number;
  alertThreshold: number;
  organization?: { id: string; name: string; slug: string; description?: string | null };
}

export interface OrganizationBudgetQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  organizationId?: string;
}

export const organizationBudgetService = {
  getOrganizationBudgets: async (query?: OrganizationBudgetQuery) => {
    const response = await apiClient.get<ApiEnvelope<PaginatedEnvelope<OrganizationBudgetRow>>>("/organization-budgets", { params: query });
    return response.data.data;
  },
  getOrganizationBudgetById: async (id: string) => {
    const response = await apiClient.get<ApiEnvelope<OrganizationBudgetRow>>(`/organization-budgets/${id}`);
    return response.data.data;
  },
  createOrganizationBudget: async (payload: { organizationId: string; monthlyBudget: number; alertThreshold?: number }) => {
    const response = await apiClient.post<ApiEnvelope<OrganizationBudgetRow>>("/organization-budgets", payload);
    return response.data.data;
  },
  updateOrganizationBudget: async (id: string, payload: { organizationId?: string; monthlyBudget?: number; currentSpend?: number; alertThreshold?: number }) => {
    const response = await apiClient.put<ApiEnvelope<OrganizationBudgetRow>>(`/organization-budgets/${id}`, payload);
    return response.data.data;
  },
  deleteOrganizationBudget: async (id: string) => {
    await apiClient.delete(`/organization-budgets/${id}`);
  },
};
