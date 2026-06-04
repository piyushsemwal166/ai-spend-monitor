import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prismaClient = globalThis.__prisma__ ?? new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

if (env.NODE_ENV !== "production") {
  globalThis.__prisma__ = prismaClient;
}

export const prisma = prismaClient;

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("Prisma connected");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Prisma disconnected");
}