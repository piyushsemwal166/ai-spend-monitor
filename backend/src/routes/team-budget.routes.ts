import { Router } from "express";
import { create, getById, list, remove, update } from "@/controllers/team-budget.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { teamBudgetCreateSchema, teamBudgetIdParamSchema, teamBudgetListQuerySchema, teamBudgetUpdateSchema } from "@/validators/team-budget.validator";

const router = Router();

router.use(authMiddleware);
router.get("/", validateRequest(teamBudgetListQuerySchema, "query"), asyncHandler(list));
router.post("/", validateRequest(teamBudgetCreateSchema), asyncHandler(create));
router.get("/:id", validateRequest(teamBudgetIdParamSchema, "params"), asyncHandler(getById));
router.put("/:id", validateRequest(teamBudgetIdParamSchema, "params"), validateRequest(teamBudgetUpdateSchema), asyncHandler(update));
router.delete("/:id", validateRequest(teamBudgetIdParamSchema, "params"), asyncHandler(remove));

export default router;
