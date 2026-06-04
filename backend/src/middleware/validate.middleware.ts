import type { NextFunction, Request, RequestHandler, Response } from "express";
import { type ZodTypeAny } from "zod";
import { AppError } from "@/middleware/error.middleware";

export function validateRequest(schema: ZodTypeAny, source: "body" | "params" | "query" = "body"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const payload = source === "body" ? req.body : source === "params" ? req.params : req.query;
    const result = schema.safeParse(payload);

    if (!result.success) {
      next(
        new AppError(
          "Validation failed",
          400,
          result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
        ),
      );
      return;
    }

    try {
      if (source === "body") {
        req.body = result.data;
      } else if (source === "params") {
        (req as any).params = result.data;
      } else {
        // sometimes `req.query` is a getter-only property on IncomingMessage
        // attempt to assign, but fall back to `req.validated` to avoid runtime errors
        try {
          (req as any).query = result.data;
        } catch (_e) {
          (req as any).validated = (req as any).validated || {};
          (req as any).validated.query = result.data;
        }
      }
    } catch (e) {
      // in rare cases replacing body/params might fail; set validated fallback
      (req as any).validated = (req as any).validated || {};
      if (source === "body") (req as any).validated.body = result.data;
      if (source === "params") (req as any).validated.params = result.data;
      if (source === "query") (req as any).validated.query = result.data;
    }

    next();
  };
}