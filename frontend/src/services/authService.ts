import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

export interface AuthResponse {
  token: string;
  user: User;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ProfileResponse {
  user: User;
}

export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const response = await apiClient.post<ApiEnvelope<AuthResponse>>("/auth/login", payload);
    return response.data.data;
  },
  register: async (payload: { name: string; email: string; password: string }) => {
    const response = await apiClient.post<ApiEnvelope<AuthResponse>>("/auth/register", payload);
    return response.data.data;
  },
  logout: async () => {
    await apiClient.post("/auth/logout");
  },
  getProfile: async () => {
    const response = await apiClient.get<ApiEnvelope<ProfileResponse>>("/auth/me");
    return response.data.data;
  },
  updateProfile: async (payload: { name: string; email: string }) => {
    const response = await apiClient.put<ApiEnvelope<ProfileResponse>>("/auth/me", payload);
    return response.data.data;
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.put<ApiEnvelope<ProfileResponse>>("/auth/me/password", payload);
    return response.data.data;
  },
};