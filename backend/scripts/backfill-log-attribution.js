const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const usageLogs = await prisma.usageLog.findMany({
    select: {
      id: true,
      projectId: true,
      userId: true,
    },
  });

  let updatedUsageLogs = 0;

  for (const usageLog of usageLogs) {
    const project = await prisma.project.findUnique({
      where: { id: usageLog.projectId },
      select: { organizationId: true },
    });

    const user = usageLog.userId
      ? await prisma.user.findUnique({
          where: { id: usageLog.userId },
          select: { teamId: true },
        })
      : null;

    await prisma.usageLog.update({
      where: { id: usageLog.id },
      data: {
        organizationId: project?.organizationId ?? null,
        teamId: user?.teamId ?? null,
      },
    });

    updatedUsageLogs += 1;
  }

  const gatewayLogs = await prisma.gatewayLog.findMany({
    select: { id: true, requestId: true },
  });

  let updatedGatewayLogs = 0;

  for (const gatewayLog of gatewayLogs) {
    if (gatewayLog.requestId) {
      continue;
    }

    await prisma.gatewayLog.update({
      where: { id: gatewayLog.id },
      data: { requestId: gatewayLog.id },
    });

    updatedGatewayLogs += 1;
  }

  console.log(JSON.stringify({ usageLogs: updatedUsageLogs, gatewayLogs: updatedGatewayLogs }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });