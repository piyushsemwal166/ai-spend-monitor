import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  API_KEY_ENCRYPTION_SECRET: z.string().min(32, "API_KEY_ENCRYPTION_SECRET must be at least 32 characters"),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CLIENT_URL: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);

export const isProduction = env.NODE_ENV === "production";