import { Router } from "express";
import { status } from "@/controllers/budget-monitor.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/status", asyncHandler(status));

export default router;
