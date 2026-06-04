import type { Request, Response } from "express";
import { executeGatewayChat, getGatewayOverview, getProjectGatewayAnalytics, listGatewayLogs } from "@/services/gateway.service";
import { sendSuccess } from "@/utils/response";

export async function chat(req: Request, res: Response): Promise<Response> {
  const result = await executeGatewayChat(req.user!.id, req.body);
  return sendSuccess(res, "Gateway response generated successfully", result);
}

export async function overview(req: Request, res: Response): Promise<Response> {
  const data = await getGatewayOverview(req.user!.id);
  return sendSuccess(res, "Gateway overview fetched successfully", data);
}

export async function logs(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  const data = await listGatewayLogs(req.user!.id, query as never);
  return sendSuccess(res, "Gateway logs fetched successfully", data);
}

export async function projectGateway(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const data = await getProjectGatewayAnalytics(req.user!.id, id);
  return sendSuccess(res, "Project gateway analytics fetched successfully", data);
}
