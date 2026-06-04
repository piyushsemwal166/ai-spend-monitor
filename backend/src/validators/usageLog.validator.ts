import { z } from "zod";

export const usageLogIdParamSchema = z.object({
  id: z.string().min(1),
});

export const usageLogCreateSchema = z.object({
  projectId: z.string().min(1),
  model: z.string().trim().min(1).max(120),
  provider: z.enum(["GEMINI", "OPENAI", "ANTHROPIC", "GOOGLE", "AZURE"]),
  tokens: z.coerce.number().int().nonnegative(),
  cost: z.coerce.number().nonnegative(),
  requestCount: z.coerce.number().int().positive().optional(),
});

export const usageLogUpdateSchema = usageLogCreateSchema.partial();

export const usageLogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  projectId: z.string().min(1).optional(),
});