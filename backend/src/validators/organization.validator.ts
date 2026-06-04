import { z } from "zod";

export const organizationIdParamSchema = z.object({
  id: z.string().min(1),
});

export const organizationCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
});

export const organizationUpdateSchema = organizationCreateSchema.partial();

export const organizationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});