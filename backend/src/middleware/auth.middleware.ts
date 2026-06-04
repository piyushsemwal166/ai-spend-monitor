import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/middleware/error.middleware";
import { verifyAccessToken } from "@/utils/jwt";

function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      out[key] = decodeURIComponent(val);
    }
  });
  return out;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  let token: string | undefined;

  if (header?.startsWith("Bearer ")) {
    token = header.slice(7);
  } else {
    // Fallback to cookie named `ai-spend-token`
    const cookies = parseCookieHeader(req.headers.cookie as string | undefined);
    if (cookies["ai-spend-token"]) token = cookies["ai-spend-token"];
  }

  if (!token) {
    next(new AppError("Authentication required", 401));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}