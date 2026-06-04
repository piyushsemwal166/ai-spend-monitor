import { Router } from "express";
import { create, getById, list, remove, update } from "@/controllers/budget.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { budgetCreateSchema, budgetIdParamSchema, budgetListQuerySchema, budgetUpdateSchema } from "@/validators/budget.validator";

const router = Router();

router.use(authMiddleware);
router.get("/", validateRequest(budgetListQuerySchema, "query"), asyncHandler(list));
router.post("/", validateRequest(budgetCreateSchema), asyncHandler(create));
router.get("/:id", validateRequest(budgetIdParamSchema, "params"), asyncHandler(getById));
router.put(
  "/:id",
  validateRequest(budgetIdParamSchema, "params"),
  validateRequest(budgetUpdateSchema),
  asyncHandler(update),
);
router.delete("/:id", validateRequest(budgetIdParamSchema, "params"), asyncHandler(remove));

export default router;