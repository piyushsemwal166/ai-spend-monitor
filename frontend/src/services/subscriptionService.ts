import { apiClient } from "@/lib/api-client";

export const subscriptionService = {
  getPlans: async () => {
    const res = await apiClient.get("/subscription/plans");
    return res.data.data;
  },
  getCurrent: async () => {
    const res = await apiClient.get("/subscription/current");
    return res.data.data;
  },
};

export default subscriptionService;
