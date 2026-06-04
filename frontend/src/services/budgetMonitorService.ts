import { apiClient } from "@/lib/api-client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BudgetStatus {
  currentSpend: number;
  remainingBudget: number;
  monthlyBudget: number;
  utilizationPercentage: number;
  status: "NORMAL" | "WARNING" | "CRITICAL" | "EXCEEDED";
}

export const budgetMonitorService = {
  getStatus: async () => {
    const response = await apiClient.get<ApiEnvelope<BudgetStatus>>("/budgets/status");
    return response.data.data;
  },
};
