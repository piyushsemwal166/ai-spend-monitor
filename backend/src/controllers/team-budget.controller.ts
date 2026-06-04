import type { Request, Response } from "express";
import { createTeamBudget, deleteTeamBudget, getTeamBudgetById, listTeamBudgets, updateTeamBudget } from "@/services/team-budget.service";
import { sendSuccess } from "@/utils/response";

export async function list(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  const result = await listTeamBudgets(req.user!.id, query as never);
  return sendSuccess(res, "Team budgets fetched successfully", result);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const budget = await createTeamBudget(req.user!.id, req.body);
  return sendSuccess(res, "Team budget created successfully", budget, 201);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await getTeamBudgetById(req.user!.id, id);
  return sendSuccess(res, "Team budget fetched successfully", budget);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await updateTeamBudget(req.user!.id, id, req.body);
  return sendSuccess(res, "Team budget updated successfully", budget);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await deleteTeamBudget(req.user!.id, id);
  return sendSuccess(res, "Team budget deleted successfully", budget);
}
