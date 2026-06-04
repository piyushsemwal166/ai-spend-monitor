import type { Request, Response } from "express";
import { getBudgetStatus } from "@/services/budget-monitor.service";
import { sendSuccess } from "@/utils/response";

export async function status(req: Request, res: Response): Promise<Response> {
  const data = await getBudgetStatus(req.user!.id);
  return sendSuccess(res, "Budget status fetched successfully", data);
}
