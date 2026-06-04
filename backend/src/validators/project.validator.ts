import { z } from "zod";

export const projectIdParamSchema = z.object({
  id: z.string().min(1),
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  organizationId: z.string().min(1),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().omit({ organizationId: true });

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  organizationId: z.string().min(1).optional(),
});