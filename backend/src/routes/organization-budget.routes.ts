import { Router } from "express";
import { create, getById, list, remove, update } from "@/controllers/organization-budget.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { organizationBudgetCreateSchema, organizationBudgetIdParamSchema, organizationBudgetListQuerySchema, organizationBudgetUpdateSchema } from "@/validators/organization-budget.validator";

const router = Router();

router.use(authMiddleware);
router.get("/", validateRequest(organizationBudgetListQuerySchema, "query"), asyncHandler(list));
router.post("/", validateRequest(organizationBudgetCreateSchema), asyncHandler(create));
router.get("/:id", validateRequest(organizationBudgetIdParamSchema, "params"), asyncHandler(getById));
router.put("/:id", validateRequest(organizationBudgetIdParamSchema, "params"), validateRequest(organizationBudgetUpdateSchema), asyncHandler(update));
router.delete("/:id", validateRequest(organizationBudgetIdParamSchema, "params"), asyncHandler(remove));

export default router;
