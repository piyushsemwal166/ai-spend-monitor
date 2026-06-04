import { apiClient } from "@/lib/api-client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardSummary {
  todaySpend: number;
  monthlySpend: number;
  remainingBudget: number;
  totalProjects: number;
  totalRequests: number;
  totalTokens: number;
  estimatedCost: number;
  mostUsedModel: string | null;
}

export interface DailySpendPoint {
  date: string;
  spend: number;
}

export interface MonthlySpendPoint {
  month: string;
  spend: number;
}

export const dashboardService = {
  getSummary: async () => {
    const response = await apiClient.get<ApiEnvelope<DashboardSummary>>("/dashboard/summary");
    return response.data.data;
  },
  getDailySpend: async () => {
    const response = await apiClient.get<ApiEnvelope<DailySpendPoint[]>>("/dashboard/spend/daily");
    return response.data.data;
  },
  getMonthlySpend: async () => {
    const response = await apiClient.get<ApiEnvelope<MonthlySpendPoint[]>>("/dashboard/spend/monthly");
    return response.data.data;
  },
};