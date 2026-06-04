import { Router } from "express";
import { getById, list } from "@/controllers/usageLog.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { usageLogIdParamSchema, usageLogListQuerySchema } from "@/validators/usageLog.validator";

const router = Router();

// All UsageLog write operations are internal-only. Public API exposes read-only endpoints.
router.use(authMiddleware);
router.get("/", validateRequest(usageLogListQuerySchema, "query"), asyncHandler(list));
router.get("/:id", validateRequest(usageLogIdParamSchema, "params"), asyncHandler(getById));

export default router;