import type { Request, Response } from "express";
import {
  createOrganization,
  deleteOrganization,
  getOrganizationById,
  listOrganizations,
  updateOrganization,
} from "@/services/organization.service";
import { sendSuccess } from "@/utils/response";

export async function list(req: Request, res: Response): Promise<Response> {
  const query = (req as any).validated?.query ?? req.query;
  const result = await listOrganizations(req.user!.id, query as never);
  return sendSuccess(res, "Organizations fetched successfully", result);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const organization = await createOrganization(req.user!.id, req.body);
  return sendSuccess(res, "Organization created successfully", organization, 201);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const organization = await getOrganizationById(req.user!.id, id);
  return sendSuccess(res, "Organization fetched successfully", organization);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const organization = await updateOrganization(req.user!.id, id, req.body);
  return sendSuccess(res, "Organization updated successfully", organization);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const organization = await deleteOrganization(req.user!.id, id);
  return sendSuccess(res, "Organization deleted successfully", organization);
}