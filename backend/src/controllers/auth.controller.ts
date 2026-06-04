import type { Request, Response } from "express";
import { changePassword, getCurrentUser, loginUser, registerUser, updateProfile } from "@/services/auth.service";
import { sendSuccess } from "@/utils/response";
import { isProduction } from "@/config/env";

const COOKIE_NAME = "ai-spend-token";
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days in ms

export async function register(req: Request, res: Response): Promise<Response> {
  const result = await registerUser(req.body);
  try {
    res.cookie(COOKIE_NAME, result.token, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });
  } catch (_e) {
    // ignore cookie set failures in non-browser environments
  }
  return sendSuccess(res, "User registered successfully", result, 201);
}

export async function login(req: Request, res: Response): Promise<Response> {
  const result = await loginUser(req.body);
  try {
    res.cookie(COOKIE_NAME, result.token, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });
  } catch (_e) {
    // ignore cookie set failures
  }
  return sendSuccess(res, "Login successful", result);
}

export async function me(req: Request, res: Response): Promise<Response> {
  const user = await getCurrentUser(req.user!.id);
  return sendSuccess(res, "User profile fetched successfully", { user });
}

export async function updateMe(req: Request, res: Response): Promise<Response> {
  const user = await updateProfile(req.user!.id, req.body);
  return sendSuccess(res, "Profile updated successfully", { user });
}

export async function changePasswordMe(req: Request, res: Response): Promise<Response> {
  const user = await changePassword(req.user!.id, req.body);
  return sendSuccess(res, "Password updated successfully", { user });
}

export async function logout(_req: Request, res: Response): Promise<Response> {
  try {
    res.clearCookie("ai-spend-token", { path: "/" });
  } catch (_e) {
    // ignore
  }

  return sendSuccess(res, "Logged out successfully", {});
}