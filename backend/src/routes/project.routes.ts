import { Router } from "express";
import { create, getById, list, projectAnalytics, projectGateway, remove, update } from "@/controllers/project.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { projectCreateSchema, projectIdParamSchema, projectListQuerySchema, projectUpdateSchema } from "@/validators/project.validator";

const router = Router();

router.use(authMiddleware);
router.get("/", validateRequest(projectListQuerySchema, "query"), asyncHandler(list));
router.post("/", validateRequest(projectCreateSchema), asyncHandler(create));
router.get("/:id", validateRequest(projectIdParamSchema, "params"), asyncHandler(getById));
router.get("/:id/analytics", validateRequest(projectIdParamSchema, "params"), asyncHandler(projectAnalytics));
router.get("/:id/gateway", validateRequest(projectIdParamSchema, "params"), asyncHandler(projectGateway));
router.put(
  "/:id",
  validateRequest(projectIdParamSchema, "params"),
  validateRequest(projectUpdateSchema),
  asyncHandler(update),
);
router.delete("/:id", validateRequest(projectIdParamSchema, "params"), asyncHandler(remove));

export default router;