import { Router } from "express";
import { create, getById, list, remove, update } from "@/controllers/team.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { teamCreateSchema, teamIdParamSchema, teamUpdateSchema } from "@/validators/team.validator";

const router = Router();

router.use(authMiddleware);
router.get("/", asyncHandler(list));
router.post("/", validateRequest(teamCreateSchema), asyncHandler(create));
router.get("/:id", validateRequest(teamIdParamSchema, "params"), asyncHandler(getById));
router.put("/:id", validateRequest(teamIdParamSchema, "params"), validateRequest(teamUpdateSchema), asyncHandler(update));
router.delete("/:id", validateRequest(teamIdParamSchema, "params"), asyncHandler(remove));

export default router;
