import { Router } from "express";
import { models, overview, projectAnalytics, topProjects, topTeams, topUsers } from "@/controllers/analytics.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { asyncHandler } from "@/middleware/error.middleware";
import { validateRequest } from "@/middleware/validate.middleware";
import { projectIdParamSchema } from "@/validators/project.validator";

const router = Router();

router.use(authMiddleware);
router.get("/overview", asyncHandler(overview));
router.get("/top-users", asyncHandler(topUsers));
router.get("/top-teams", asyncHandler(topTeams));
router.get("/top-projects", asyncHandler(topProjects));
router.get("/models", asyncHandler(models));
router.get("/projects/:id", validateRequest(projectIdParamSchema, "params"), asyncHandler(projectAnalytics));

export default router;
