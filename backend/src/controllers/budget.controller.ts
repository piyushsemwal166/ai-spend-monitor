import type { Request, Response } from "express";
import { createBudget, deleteBudget, getBudgetById, listBudgets, updateBudget } from "@/services/budget.service";
import { sendSuccess } from "@/utils/response";
import { logger } from "@/utils/logger";

export async function list(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  logger.info("Budget list request", { userId: req.user?.id, query });
  const result = await listBudgets(req.user!.id, query as never);
  logger.info("Budget list result", { userId: req.user?.id, count: Array.isArray(result.items) ? result.items.length : 0 });
  return sendSuccess(res, "Budgets fetched successfully", result);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const budget = await createBudget(req.user!.id, req.body);
  return sendSuccess(res, "Budget created successfully", budget, 201);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await getBudgetById(req.user!.id, id);
  return sendSuccess(res, "Budget fetched successfully", budget);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await updateBudget(req.user!.id, id, req.body);
  return sendSuccess(res, "Budget updated successfully", budget);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const budget = await deleteBudget(req.user!.id, id);
  return sendSuccess(res, "Budget deleted successfully", budget);
}