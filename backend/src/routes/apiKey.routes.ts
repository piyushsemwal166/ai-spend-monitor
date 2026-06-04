import { Router } from "express";
import { create, getById, list, remove, update } from "@/controllers/apiKey.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { apiKeyCreateSchema, apiKeyIdParamSchema, apiKeyListQuerySchema, apiKeyUpdateSchema } from "@/validators/apiKey.validator";

const router = Router();

router.use(authMiddleware);
router.get("/", validateRequest(apiKeyListQuerySchema, "query"), asyncHandler(list));
router.post("/", validateRequest(apiKeyCreateSchema), asyncHandler(create));
router.get("/:id", validateRequest(apiKeyIdParamSchema, "params"), asyncHandler(getById));
router.put("/:id", validateRequest(apiKeyIdParamSchema, "params"), validateRequest(apiKeyUpdateSchema), asyncHandler(update));
router.delete("/:id", validateRequest(apiKeyIdParamSchema, "params"), asyncHandler(remove));

export default router;