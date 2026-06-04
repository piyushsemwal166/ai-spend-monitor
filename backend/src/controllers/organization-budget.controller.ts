import type { Request, Response } from "express";
import { createOrganizationBudget, deleteOrganizationBudget, getOrganizationBudgetById, listOrganizationBudgets, updateOrganizationBudget } from "@/services/organization-budget.service";
import { sendSuccess } from "@/utils/response";

export async function list(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  const result = await listOrganizationBudgets(req.user!.id, query as never);
  return sendSuccess(res, "Organization budgets fetched successfully", result);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const budget = await createOrganizationBudget(req.user!.id, req.body);
  return sendSuccess(res, "Organization budget created successfully", budget, 201);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await getOrganizationBudgetById(req.user!.id, id);
  return sendSuccess(res, "Organization budget fetched successfully", budget);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await updateOrganizationBudget(req.user!.id, id, req.body);
  return sendSuccess(res, "Organization budget updated successfully", budget);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await deleteOrganizationBudget(req.user!.id, id);
  return sendSuccess(res, "Organization budget deleted successfully", budget);
}
