import app from "@/app";
import { env } from "@/config/env";
import { connectDatabase, disconnectDatabase } from "@/config/prisma";
import { logger } from "@/utils/logger";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`AI Spend OS backend running on port ${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.warn(`Received ${signal}, shutting down gracefully`);

    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", reason);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error);
    process.exit(1);
  });
}

void bootstrap().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});