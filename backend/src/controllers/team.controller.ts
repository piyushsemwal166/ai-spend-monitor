import type { Request, Response } from "express";
import { createTeam, deleteTeam, getTeamById, listTeams, updateTeam } from "@/services/team.service";
import { sendSuccess } from "@/utils/response";

export async function list(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  const result = await listTeams(req.user!.id, query as never);
  return sendSuccess(res, "Teams fetched successfully", result);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const team = await createTeam(req.user!.id, req.body);
  return sendSuccess(res, "Team created successfully", team, 201);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const team = await getTeamById(req.user!.id, id);
  return sendSuccess(res, "Team fetched successfully", team);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const team = await updateTeam(req.user!.id, id, req.body);
  return sendSuccess(res, "Team updated successfully", team);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const team = await deleteTeam(req.user!.id, id);
  return sendSuccess(res, "Team deleted successfully", team);
}
