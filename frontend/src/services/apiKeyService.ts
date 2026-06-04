import { apiClient } from "@/lib/api-client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiKeyRecord {
  id: string;
  organizationId: string;
  provider: "GEMINI";
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ApiKeyQuery {
  organizationId?: string;
}

export const apiKeyService = {
  getApiKeys: async (query?: ApiKeyQuery) => {
    const response = await apiClient.get<ApiEnvelope<ApiKeyRecord[]>>("/api-keys", { params: query });
    return response.data.data;
  },
  createApiKey: async (payload: { organizationId: string; provider: "GEMINI"; key: string }) => {
    const response = await apiClient.post<ApiEnvelope<ApiKeyRecord>>("/api-keys", payload);
    return response.data.data;
  },
  updateApiKey: async (id: string, payload: { key: string }) => {
    const response = await apiClient.put<ApiEnvelope<ApiKeyRecord>>(`/api-keys/${id}`, payload);
    return response.data.data;
  },
  deleteApiKey: async (id: string) => {
    await apiClient.delete(`/api-keys/${id}`);
  },
};