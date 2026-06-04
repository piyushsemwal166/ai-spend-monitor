import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { API_PREFIX } from "@/config/constants";
import { env } from "@/config/env";
import { apiLimiter } from "@/middleware/rateLimit.middleware";
import { errorHandler, notFoundHandler } from "@/middleware/error.middleware";
import { logger } from "@/utils/logger";
import { logger as requestLogger } from "@/utils/logger";
import authRoutes from "@/routes/auth.routes";
import budgetRoutes from "@/routes/budget.routes";
import apiKeyRoutes from "@/routes/apiKey.routes";
import analyticsRoutes from "@/routes/analytics.routes";
import dashboardRoutes from "@/routes/dashboard.routes";
import budgetMonitorRoutes from "@/routes/budget-monitor.routes";
import gatewayRoutes from "@/routes/gateway.routes";
import organizationBudgetRoutes from "@/routes/organization-budget.routes";
import organizationRoutes from "@/routes/organization.routes";
import projectRoutes from "@/routes/project.routes";
import teamBudgetRoutes from "@/routes/team-budget.routes";
import teamRoutes from "@/routes/team.routes";
import usageLogRoutes from "@/routes/usageLog.routes";
import subscriptionRoutes from "@/routes/subscription.routes";
import billingRoutes from "@/routes/billing.routes";

const app = express();

const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins.length > 1 ? allowedOrigins : allowedOrigins[0] ?? true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined", { stream: logger.stream }));
app.use(apiLimiter);

// simple request logger for debugging
app.use((req, _res, next) => {
  requestLogger.info("Incoming HTTP request", { method: req.method, url: req.originalUrl });
  next();
});

app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/organizations`, organizationRoutes);
app.use(`${API_PREFIX}/projects`, projectRoutes);
app.use(`${API_PREFIX}/budgets`, budgetRoutes);
app.use(`${API_PREFIX}/api-keys`, apiKeyRoutes);
app.use(`${API_PREFIX}/gateway`, gatewayRoutes);
app.use(`${API_PREFIX}/usage-logs`, usageLogRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/teams`, teamRoutes);
app.use(`${API_PREFIX}/team-budgets`, teamBudgetRoutes);
app.use(`${API_PREFIX}/organization-budgets`, organizationBudgetRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/budgets`, budgetMonitorRoutes);
app.use(`${API_PREFIX}/subscription`, subscriptionRoutes);
app.use(`${API_PREFIX}/billing`, billingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;