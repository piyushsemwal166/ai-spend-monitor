import { apiClient } from "@/lib/api-client";
import type { Project } from "@/types";

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

export interface ProjectQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  organizationId?: string;
}

export const projectService = {
  getProjects: async (query?: ProjectQuery) => {
    const response = await apiClient.get<ApiEnvelope<PaginatedEnvelope<Project>>>('/projects', { params: query });
    return response.data.data;
  },
  getProjectById: async (id: string) => {
    const response = await apiClient.get<ApiEnvelope<Project>>(`/projects/${id}`);
    return response.data.data;
  },
  createProject: async (payload: { name: string; description?: string; organizationId: string; status: "ACTIVE" | "PAUSED" | "ARCHIVED" }) => {
    const response = await apiClient.post<ApiEnvelope<Project>>("/projects", payload);
    return response.data.data;
  },
  updateProject: async (id: string, payload: { name?: string; description?: string; status?: "ACTIVE" | "PAUSED" | "ARCHIVED" }) => {
    const response = await apiClient.put<ApiEnvelope<Project>>(`/projects/${id}`, payload);
    return response.data.data;
  },
  deleteProject: async (id: string) => {
    await apiClient.delete(`/projects/${id}`);
  },
};