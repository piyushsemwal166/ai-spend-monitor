import { z } from "zod";

export const organizationBudgetIdParamSchema = z.object({
  id: z.string().min(1),
});

export const organizationBudgetCreateSchema = z.object({
  organizationId: z.string().min(1),
  monthlyBudget: z.coerce.number().positive(),
  alertThreshold: z.coerce.number().int().min(1).max(100).optional(),
});

export const organizationBudgetUpdateSchema = z.object({
  organizationId: z.string().min(1).optional(),
  monthlyBudget: z.coerce.number().positive().optional(),
  currentSpend: z.coerce.number().nonnegative().optional(),
  alertThreshold: z.coerce.number().int().min(1).max(100).optional(),
});

export const organizationBudgetListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  organizationId: z.string().min(1).optional(),
});
