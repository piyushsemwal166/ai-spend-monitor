import { z } from "zod";

export const apiKeyIdParamSchema = z.object({
  id: z.string().min(1),
});

export const apiKeyCreateSchema = z.object({
  organizationId: z.string().min(1),
  provider: z.literal("GEMINI"),
  key: z.string().trim().min(1).max(4096),
});

export const apiKeyUpdateSchema = z.object({
  key: z.string().trim().min(1).max(4096),
});

export const apiKeyListQuerySchema = z.object({
  organizationId: z.string().min(1).optional(),
});