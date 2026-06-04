import { Router } from "express";
import { dailySpend, monthlySpend, summary } from "@/controllers/dashboard.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/summary", asyncHandler(summary));
router.get("/spend/daily", asyncHandler(dailySpend));
router.get("/spend/monthly", asyncHandler(monthlySpend));

export default router;