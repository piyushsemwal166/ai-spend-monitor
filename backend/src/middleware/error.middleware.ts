import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "@/utils/logger";
import { sendError } from "@/utils/response";
import { appendFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export class AppError extends Error {
  statusCode: number;

  errors?: Array<{ field?: string; message: string }>;

  constructor(message: string, statusCode = 500, errors?: Array<{ field?: string; message: string }>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "AppError";
  }
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): Response {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: Array<{ field?: string; message: string }> = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors ?? [];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    if (err.code === "P2002") {
      message = "Duplicate record";
      errors = [{ message: "A record with the same unique value already exists." }];
    } else if (err.code === "P2025") {
      message = "Record not found";
    } else if (err.code === "P2003") {
      message = "Foreign key constraint failed";
    } else {
      message = "Database request failed";
    }
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON payload";
  }

  logger.error(`${req.method} ${req.originalUrl}`, err instanceof Error ? { message: err.message, stack: err.stack } : err);
  try {
    const logDir = join(process.cwd(), "logs");
    if (!existsSync(logDir)) mkdirSync(logDir);
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
    };
    appendFileSync(join(logDir, "errors.log"), JSON.stringify(entry) + "\n");
  } catch (_e) {
    /* ignore logging failures */
  }
  return sendError(res, message, errors, statusCode);
}