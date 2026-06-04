import { apiClient } from "@/lib/api-client";

export const billingService = {
  getInvoices: async () => {
    const res = await apiClient.get("/billing/invoices");
    return res.data.data;
  },
};

export default billingService;
