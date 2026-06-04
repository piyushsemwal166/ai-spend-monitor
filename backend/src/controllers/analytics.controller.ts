import type { Request, Response } from "express";
import { getAnalyticsOverview, getModelAnalytics, getProjectAnalytics, getTopProjects, getTopTeams, getTopUsers } from "@/services/analytics.service";
import { sendSuccess } from "@/utils/response";

export async function overview(req: Request, res: Response): Promise<Response> {
  const data = await getAnalyticsOverview(req.user!.id);
  return sendSuccess(res, "Analytics overview fetched successfully", data);
}

export async function topUsers(req: Request, res: Response): Promise<Response> {
  const data = await getTopUsers(req.user!.id);
  return sendSuccess(res, "Top users fetched successfully", data);
}

export async function topTeams(req: Request, res: Response): Promise<Response> {
  const data = await getTopTeams(req.user!.id);
  return sendSuccess(res, "Top teams fetched successfully", data);
}

export async function topProjects(req: Request, res: Response): Promise<Response> {
  const data = await getTopProjects(req.user!.id);
  return sendSuccess(res, "Top projects fetched successfully", data);
}

export async function models(req: Request, res: Response): Promise<Response> {
  const data = await getModelAnalytics(req.user!.id);
  return sendSuccess(res, "Model analytics fetched successfully", data);
}

export async function projectAnalytics(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const data = await getProjectAnalytics(req.user!.id, id);
  return sendSuccess(res, "Project analytics fetched successfully", data);
}
