import { apiClient } from "@/lib/api-client";
import type { Organization } from "@/types";

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

export interface OrganizationMemberRecord {
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface OrganizationDetail {
  id: string;
  name: string;
  slug: string | null;
  description?: string | null;
  updatedAt: string;
  _count?: { members: number; projects: number };
  members?: OrganizationMemberRecord[];
}

export interface OrganizationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const organizationService = {
  getOrganizations: async (query?: OrganizationQuery) => {
    const response = await apiClient.get<ApiEnvelope<PaginatedEnvelope<Organization>>>("/organizations", { params: query });
    return response.data.data;
  },
  getOrganizationById: async (id: string) => {
    const response = await apiClient.get<ApiEnvelope<OrganizationDetail>>(`/organizations/${id}`);
    return response.data.data;
  },
  createOrganization: async (payload: { name: string; description?: string }) => {
    const response = await apiClient.post<ApiEnvelope<Organization>>("/organizations", payload);
    return response.data.data;
  },
  updateOrganization: async (id: string, payload: { name?: string; description?: string }) => {
    const response = await apiClient.put<ApiEnvelope<Organization>>(`/organizations/${id}`, payload);
    return response.data.data;
  },
  deleteOrganization: async (id: string) => {
    await apiClient.delete(`/organizations/${id}`);
  },
};