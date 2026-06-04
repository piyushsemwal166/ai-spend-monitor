import { Router } from "express";
import { chat, logs, overview } from "@/controllers/gateway.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { gatewayChatSchema, gatewayLogsQuerySchema } from "@/validators/gateway.validator";

const router = Router();

router.use(authMiddleware);
router.get("/overview", asyncHandler(overview));
router.get("/logs", validateRequest(gatewayLogsQuerySchema, "query"), asyncHandler(logs));
router.post("/chat", validateRequest(gatewayChatSchema), asyncHandler(chat));

export default router;
