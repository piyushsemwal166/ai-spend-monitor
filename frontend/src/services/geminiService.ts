import { apiClient } from "@/lib/api-client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface GeminiChatResponse {
  message: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  estimatedCost: number;
}

export const geminiService = {
  chat: async (payload: { projectId: string; model: "gemini-2.5-flash" | "gemini-2.5-pro"; prompt: string }) => {
    const response = await apiClient.post<ApiEnvelope<GeminiChatResponse>>("/gateway/chat", payload);
    return response.data.data;
  },
};