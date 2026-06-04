import type { Response } from "express";
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types";

export function sendSuccess<T>(res: Response, message: string, data: T, statusCode = 200): Response<ApiResponse<T>> {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendError(
  res: Response,
  message: string,
  errors: ApiErrorResponse["errors"] = [],
  statusCode = 400,
): Response<ApiErrorResponse> {
  return res.status(statusCode).json({ success: false, message, errors });
}