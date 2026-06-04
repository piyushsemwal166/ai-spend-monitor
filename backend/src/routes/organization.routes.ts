import { Router } from "express";
import { create, getById, list, remove, update } from "@/controllers/organization.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import {
  organizationCreateSchema,
  organizationIdParamSchema,
  organizationListQuerySchema,
  organizationUpdateSchema,
} from "@/validators/organization.validator";

const router = Router();

router.use(authMiddleware);
router.get("/", validateRequest(organizationListQuerySchema, "query"), asyncHandler(list));
router.post("/", validateRequest(organizationCreateSchema), asyncHandler(create));
router.get("/:id", validateRequest(organizationIdParamSchema, "params"), asyncHandler(getById));
router.put(
  "/:id",
  validateRequest(organizationIdParamSchema, "params"),
  validateRequest(organizationUpdateSchema),
  asyncHandler(update),
);
router.delete("/:id", validateRequest(organizationIdParamSchema, "params"), asyncHandler(remove));

export default router;