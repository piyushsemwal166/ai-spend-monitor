import { Router } from "express";
import { getInvoices } from "@/controllers/billing.controller";
import { asyncHandler } from "@/middleware/error.middleware";
import { authMiddleware } from "@/middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/invoices", asyncHandler(getInvoices));

export default router;
