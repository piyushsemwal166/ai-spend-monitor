import type { Request, Response } from "express";
import { createProject, deleteProject, getProjectById, listProjects, updateProject } from "@/services/project.service";
import { getProjectAnalytics } from "@/services/analytics.service";
import { getProjectGatewayAnalytics } from "@/services/gateway.service";
import { sendSuccess } from "@/utils/response";

export async function list(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  const result = await listProjects(req.user!.id, query as never);
  return sendSuccess(res, "Projects fetched successfully", result);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const project = await createProject(req.user!.id, req.body);
  return sendSuccess(res, "Project created successfully", project, 201);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const project = await getProjectById(req.user!.id, id);
  return sendSuccess(res, "Project fetched successfully", project);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const project = await updateProject(req.user!.id, id, req.body);
  return sendSuccess(res, "Project updated successfully", project);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const project = await deleteProject(req.user!.id, id);
  return sendSuccess(res, "Project deleted successfully", project);
}

export async function projectAnalytics(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await getProjectAnalytics(req.user!.id, id);
  return sendSuccess(res, "Project analytics fetched successfully", result);
}

export async function projectGateway(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await getProjectGatewayAnalytics(req.user!.id, id);
  return sendSuccess(res, "Project gateway analytics fetched successfully", result);
}