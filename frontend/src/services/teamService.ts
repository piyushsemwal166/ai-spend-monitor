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

export interface TeamMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface TeamMemberRecord {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TeamRecord {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  organization?: { id: string; name: string; slug: string };
  members?: TeamMember[];
  _count?: { members: number };
}

export interface TeamQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  organizationId?: string;
}

export const teamService = {
  getTeams: async (query?: TeamQuery) => {
    const response = await apiClient.get<ApiEnvelope<PaginatedEnvelope<TeamRecord>>>("/teams", { params: query });
    return response.data.data;
  },
  getTeamById: async (id: string) => {
    const response = await apiClient.get<ApiEnvelope<TeamRecord>>(`/teams/${id}`);
    return response.data.data;
  },
  createTeam: async (payload: { organizationId: string; name: string; memberIds?: string[] }) => {
    const response = await apiClient.post<ApiEnvelope<TeamRecord>>("/teams", payload);
    return response.data.data;
  },
  updateTeam: async (id: string, payload: { name?: string; memberIds?: string[] }) => {
    const response = await apiClient.put<ApiEnvelope<TeamRecord>>(`/teams/${id}`, payload);
    return response.data.data;
  },
  deleteTeam: async (id: string) => {
    await apiClient.delete(`/teams/${id}`);
  },
};
