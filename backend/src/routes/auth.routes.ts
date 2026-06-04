import { Router } from "express";
import { changePasswordMe, login, logout, me, register, updateMe } from "@/controllers/auth.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { changePasswordSchema, loginSchema, registerSchema, updateProfileSchema } from "@/validators/auth.validator";

const router = Router();

router.post("/register", validateRequest(registerSchema), asyncHandler(register));
router.post("/login", validateRequest(loginSchema), asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(me));
router.put("/me", authMiddleware, validateRequest(updateProfileSchema), asyncHandler(updateMe));
router.put("/me/password", authMiddleware, validateRequest(changePasswordSchema), asyncHandler(changePasswordMe));
router.post("/logout", asyncHandler(logout));

export default router;