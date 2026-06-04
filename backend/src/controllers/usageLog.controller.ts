import type { Request, Response } from "express";
import { getUsageLogById, listUsageLogs } from "@/services/usageLog.service";
import { sendSuccess } from "@/utils/response";

export async function list(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  const result = await listUsageLogs(req.user!.id, query as never);
  return sendSuccess(res, "Usage logs fetched successfully", result);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const usageLog = await getUsageLogById(req.user!.id, id);
  return sendSuccess(res, "Usage log fetched successfully", usageLog);
}