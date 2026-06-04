import type { Request, Response } from "express";
import { createApiKey, deleteApiKey, getApiKeyById, listApiKeys, updateApiKey } from "@/services/apiKey.service";
import { sendSuccess } from "@/utils/response";

export async function list(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  const result = await listApiKeys(req.user!.id, (query as { organizationId?: string }).organizationId);
  return sendSuccess(res, "API keys fetched successfully", result);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const apiKey = await createApiKey(req.user!.id, req.body);
  return sendSuccess(res, "API key created successfully", apiKey, 201);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const apiKey = await getApiKeyById(req.user!.id, id);
  return sendSuccess(res, "API key fetched successfully", apiKey);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const apiKey = await updateApiKey(req.user!.id, id, req.body);
  return sendSuccess(res, "API key updated successfully", apiKey);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const apiKey = await deleteApiKey(req.user!.id, id);
  return sendSuccess(res, "API key deleted successfully", apiKey);
}