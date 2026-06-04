import { Router } from "express";
import { getCurrentSubscription, getPlans } from "@/controllers/subscription.controller";
import { asyncHandler } from "@/middleware/error.middleware";
import { authMiddleware } from "@/middleware/auth.middleware";

const router = Router();

router.get("/plans", asyncHandler(getPlans));
router.get("/current", authMiddleware, asyncHandler(getCurrentSubscription));

export default router;
