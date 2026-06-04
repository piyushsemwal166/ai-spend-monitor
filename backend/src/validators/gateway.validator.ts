import { z } from "zod";

export const gatewayChatSchema = z.object({
  projectId: z.string().min(1),
  model: z.enum(["gemini-2.5-flash", "gemini-2.5-pro"]),
  prompt: z.string().trim().min(1).max(20000),
});

export const gatewayIdParamSchema = z.object({
  id: z.string().min(1),
});

export const gatewayLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  projectId: z.string().min(1).optional(),
  provider: z.enum(["GEMINI", "OPENAI", "ANTHROPIC", "GOOGLE", "AZURE"]).optional(),
  status: z.enum(["SUCCESS", "BLOCKED", "FAILED"]).optional(),
});
