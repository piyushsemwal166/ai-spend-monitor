import { z } from "zod";

export const teamIdParamSchema = z.object({
  id: z.string().min(1),
});

export const teamCreateSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  memberIds: z.array(z.string().min(1)).optional(),
});

export const teamUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  memberIds: z.array(z.string().min(1)).optional(),
});
