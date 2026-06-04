import type { Request, Response } from "express";
import { getDashboardSummary, getDailySpendSeries, getMonthlySpendSeries } from "@/services/dashboard.service";
import { sendSuccess } from "@/utils/response";

export async function summary(req: Request, res: Response): Promise<Response> {
  const data = await getDashboardSummary(req.user!.id);
  return sendSuccess(res, "Dashboard summary fetched successfully", data);
}

export async function dailySpend(req: Request, res: Response): Promise<Response> {
  const data = await getDailySpendSeries(req.user!.id);
  return sendSuccess(res, "Daily spend series fetched successfully", data);
}

export async function monthlySpend(req: Request, res: Response): Promise<Response> {
  const data = await getMonthlySpendSeries(req.user!.id);
  return sendSuccess(res, "Monthly spend series fetched successfully", data);
}