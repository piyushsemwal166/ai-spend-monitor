import { Prisma, type GatewayStatus, type Provider } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { calculateCost } from "@/utils/cost-calculator";
import { buildPaginationMeta, parsePaginationQuery } from "@/utils/pagination";
import { assertProjectAccess, getAccessibleProjectIds } from "@/services/project.service";
import { createUsageLog } from "@/services/usageLog.service";
import { getDecryptedApiKeyForOrganization } from "@/services/apiKey.service";
import { getModelPricing } from "@/services/modelPricing.service";
import { getProviderAdapter } from "@/registry/provider-registry";

export interface GatewayChatInput {
  projectId: string;
  provider?: Provider;
  model: string;
  prompt: string;
}

const DEFAULT_OUTPUT_TOKEN_RESERVE = 512;
const PROVIDER_SEARCH_CANDIDATES = ["GEMINI", "OPENAI", "ANTHROPIC", "GOOGLE", "AZURE"] as const;

type GatewayLogsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  projectId?: string;
  provider?: Provider;
  status?: GatewayStatus;
};

function estimatePromptTokens(prompt: string): number {
  return Math.max(1, Math.ceil(prompt.length / 4));
}

function estimateOutputTokens(prompt: string): number {
  return Math.max(128, Math.min(DEFAULT_OUTPUT_TOKEN_RESERVE, Math.ceil(prompt.length / 8)));
}

async function reserveProjectBudget(projectId: string, amount: Prisma.Decimal, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const rows = await client.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    UPDATE "Budget"
    SET "currentSpend" = "currentSpend" + ${amount},
        "remainingBudget" = "monthlyBudget" - ("currentSpend" + ${amount})
    WHERE "projectId" = ${projectId}
      AND ("currentSpend" + ${amount}) <= "monthlyBudget"
    RETURNING "id"
  `);

  if (rows.length > 0) {
    return true;
  }

  const budgetExists = await client.budget.findUnique({ where: { projectId }, select: { id: true } });
  if (budgetExists) {
    throw new AppError("Project budget exceeded", 403);
  }

  return false;
}

async function reserveTeamBudget(teamId: string, amount: Prisma.Decimal, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const rows = await client.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    UPDATE "TeamBudget"
    SET "currentSpend" = "currentSpend" + ${amount},
        "remainingBudget" = "monthlyBudget" - ("currentSpend" + ${amount})
    WHERE "teamId" = ${teamId}
      AND ("currentSpend" + ${amount}) <= "monthlyBudget"
    RETURNING "id"
  `);

  if (rows.length > 0) {
    return true;
  }

  const budgetExists = await client.teamBudget.findUnique({ where: { teamId }, select: { id: true } });
  if (budgetExists) {
    throw new AppError("Team budget exceeded", 403);
  }

  return false;
}

async function reserveOrganizationBudget(organizationId: string, amount: Prisma.Decimal, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const rows = await client.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    UPDATE "OrganizationBudget"
    SET "currentSpend" = "currentSpend" + ${amount},
        "remainingBudget" = "monthlyBudget" - ("currentSpend" + ${amount})
    WHERE "organizationId" = ${organizationId}
      AND ("currentSpend" + ${amount}) <= "monthlyBudget"
    RETURNING "id"
  `);

  if (rows.length > 0) {
    return true;
  }

  const budgetExists = await client.organizationBudget.findUnique({ where: { organizationId }, select: { id: true } });
  if (budgetExists) {
    throw new AppError("Organization budget exceeded", 403);
  }

  return false;
}

async function releaseProjectBudget(projectId: string, amount: Prisma.Decimal, client: typeof prisma | Prisma.TransactionClient = prisma) {
  await client.$executeRaw(Prisma.sql`
    UPDATE "Budget"
    SET "currentSpend" = GREATEST("currentSpend" - ${amount}, 0),
        "remainingBudget" = "monthlyBudget" - GREATEST("currentSpend" - ${amount}, 0)
    WHERE "projectId" = ${projectId}
  `);
}

async function releaseTeamBudget(teamId: string, amount: Prisma.Decimal, client: typeof prisma | Prisma.TransactionClient = prisma) {
  await client.$executeRaw(Prisma.sql`
    UPDATE "TeamBudget"
    SET "currentSpend" = GREATEST("currentSpend" - ${amount}, 0),
        "remainingBudget" = "monthlyBudget" - GREATEST("currentSpend" - ${amount}, 0)
    WHERE "teamId" = ${teamId}
  `);
}

async function releaseOrganizationBudget(organizationId: string, amount: Prisma.Decimal, client: typeof prisma | Prisma.TransactionClient = prisma) {
  await client.$executeRaw(Prisma.sql`
    UPDATE "OrganizationBudget"
    SET "currentSpend" = GREATEST("currentSpend" - ${amount}, 0),
        "remainingBudget" = "monthlyBudget" - GREATEST("currentSpend" - ${amount}, 0)
    WHERE "organizationId" = ${organizationId}
  `);
}

async function getUserTeam(userId: string) {
  return prisma.teamMember.findFirst({
    where: { userId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

async function sumTeamSpend(teamId: string, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const rows = await client.$queryRaw<Array<{ total: Prisma.Decimal }>>(Prisma.sql`
    SELECT COALESCE(SUM(COALESCE(l."estimatedCost", l.cost)), 0) AS total
    FROM "UsageLog" l
    WHERE l."teamId" = ${teamId}
  `);

  return rows[0]?.total ?? new Prisma.Decimal(0);
}

async function sumOrganizationSpend(organizationId: string, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const rows = await client.$queryRaw<Array<{ total: Prisma.Decimal }>>(Prisma.sql`
    SELECT COALESCE(SUM(COALESCE(l."estimatedCost", l.cost)), 0) AS total
    FROM "UsageLog" l
    WHERE l."organizationId" = ${organizationId}
  `);

  return rows[0]?.total ?? new Prisma.Decimal(0);
}

async function recalculateTeamBudget(teamId: string, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const budget = await client.teamBudget.findUnique({ where: { teamId } });
  if (!budget) return;

  const currentSpend = await sumTeamSpend(teamId, client);
  const remainingBudget = new Prisma.Decimal(budget.monthlyBudget).minus(currentSpend);

  await client.teamBudget.update({
    where: { teamId },
    data: { currentSpend, remainingBudget },
  });
}

async function recalculateOrganizationBudget(organizationId: string, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const budget = await client.organizationBudget.findUnique({ where: { organizationId } });
  if (!budget) return;

  const currentSpend = await sumOrganizationSpend(organizationId, client);
  const remainingBudget = new Prisma.Decimal(budget.monthlyBudget).minus(currentSpend);

  await client.organizationBudget.update({
    where: { organizationId },
    data: { currentSpend, remainingBudget },
  });
}

async function writeGatewayLog(input: {
  requestId: string;
  userId: string | null;
  teamId: string | null;
  projectId: string;
  provider: Provider;
  model: string;
  latency: number;
  status: GatewayStatus;
  estimatedCost: Prisma.Decimal | number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}, client: typeof prisma | Prisma.TransactionClient = prisma) {
  return client.gatewayLog.create({
    data: {
      requestId: input.requestId,
      userId: input.userId,
      teamId: input.teamId,
      projectId: input.projectId,
      provider: input.provider,
      model: input.model,
      latency: input.latency,
      status: input.status,
      estimatedCost: new Prisma.Decimal(input.estimatedCost),
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      totalTokens: input.totalTokens,
    },
  });
}

export async function executeGatewayChat(userId: string, input: GatewayChatInput) {
  const startedAt = Date.now();
  const requestId = randomUUID();
  let estimatedInputTokens = 0;
  let estimatedOutputTokens = 0;
  let projectedCost = new Prisma.Decimal(0);

  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: {
      id: true,
      organizationId: true,
      organization: { select: { id: true, name: true } },
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  await assertProjectAccess(userId, input.projectId);

  const membership = await getUserTeam(userId);
  let reservation: {
    project: boolean;
    team: boolean;
    organization: boolean;
  } | null = null;

  let providerName: Provider = (input.provider ?? ("GEMINI" as Provider));
  try {
    const [apiKey, pricing] = await Promise.all([
      getDecryptedApiKeyForOrganization(project.organizationId, providerName),
      getModelPricing(providerName, input.model),
    ]);

    estimatedInputTokens = estimatePromptTokens(input.prompt);
    estimatedOutputTokens = estimateOutputTokens(input.prompt);
    projectedCost = calculateCost(estimatedInputTokens, estimatedOutputTokens, pricing);

    reservation = await prisma.$transaction(async (tx) => {
      let projectReserved = false;
      let team = false;
      let organization = false;

      projectReserved = await reserveProjectBudget(input.projectId, projectedCost, tx);
      if (membership?.teamId) {
        team = await reserveTeamBudget(membership.teamId, projectedCost, tx);
      }
      organization = await reserveOrganizationBudget(project.organizationId, projectedCost, tx);

      return { project: projectReserved, team, organization };
    });

    const providerAdapter = getProviderAdapter(providerName);
    const result = await providerAdapter.chat({
      apiKey,
      model: input.model,
      prompt: input.prompt,
    });

    const estimatedCost = calculateCost(result.usage.inputTokens, result.usage.outputTokens, pricing);
    const latency = Date.now() - startedAt;

    await prisma.$transaction(async (tx) => {
        await createUsageLog(userId, {
        projectId: input.projectId,
        organizationId: project.organizationId,
        teamId: membership?.teamId ?? null,
        userId,
        model: input.model,
        provider: providerName,
        tokens: result.usage.totalTokens,
        cost: Number(estimatedCost),
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        estimatedCost: Number(estimatedCost),
        requestCount: 1,
      }, tx);

        await writeGatewayLog({
        requestId,
        userId,
        teamId: membership?.teamId ?? null,
        projectId: input.projectId,
          provider: providerName,
        model: input.model,
        latency,
        status: "SUCCESS",
        estimatedCost,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
      }, tx);

      if (membership?.teamId) {
        await recalculateTeamBudget(membership.teamId, tx);
      }
      await recalculateOrganizationBudget(project.organizationId, tx);
    });

    return {
      message: result.message,
      usage: result.usage,
      estimatedCost: Number(estimatedCost),
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startedAt;
    const status: GatewayStatus = error instanceof AppError && error.statusCode === 403 ? "BLOCKED" : "FAILED";

    if (reservation?.project || reservation?.team || reservation?.organization) {
      await prisma.$transaction(async (tx) => {
        if (reservation?.project) {
          await releaseProjectBudget(input.projectId, projectedCost, tx);
        }
        if (reservation?.team && membership?.teamId) {
          await releaseTeamBudget(membership.teamId, projectedCost, tx);
        }
        if (reservation?.organization) {
          await releaseOrganizationBudget(project.organizationId, projectedCost, tx);
        }
      }).catch(() => undefined);
    }

    await writeGatewayLog({
      requestId,
      userId,
      teamId: membership?.teamId ?? null,
      projectId: input.projectId,
      provider: providerName,
      model: input.model,
      latency,
      status,
      estimatedCost: projectedCost,
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
      totalTokens: estimatedInputTokens + estimatedOutputTokens,
    }).catch(() => undefined);
    throw error;
  }
}

export async function getGatewayOverview(userId: string) {
  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return {
      totalRequests: 0,
      averageCost: 0,
      averageLatency: 0,
      providerUsage: [],
    };
  }

  const [summary, providerUsage] = await Promise.all([
    prisma.gatewayLog.aggregate({
      where: { projectId: { in: projectIds } },
      _count: { _all: true },
      _avg: { estimatedCost: true, latency: true },
    }),
    prisma.gatewayLog.groupBy({
      by: ["provider"],
      where: { projectId: { in: projectIds } },
      _count: { provider: true },
      _sum: { estimatedCost: true },
      _avg: { latency: true },
      orderBy: { _sum: { estimatedCost: "desc" } },
    }),
  ]);

  return {
    totalRequests: summary._count._all,
    averageCost: Number(summary._avg.estimatedCost ?? 0),
    averageLatency: Number(summary._avg.latency ?? 0),
    providerUsage: providerUsage.map((row) => ({
      provider: row.provider,
      requests: row._count.provider,
      totalSpend: Number(row._sum.estimatedCost ?? 0),
      averageLatency: Number(row._avg.latency ?? 0),
    })),
  };
}

export async function listGatewayLogs(userId: string, query: GatewayLogsQuery) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(query, {
    defaultSortBy: "createdAt",
    allowedSortBy: ["createdAt", "latency", "estimatedCost", "model", "status"],
  });

  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return { items: [], meta: buildPaginationMeta(0, page, limit) };
  }

  if (query.projectId) {
    await assertProjectAccess(userId, query.projectId);
  }

  const searchProvider = typeof search === "string" && PROVIDER_SEARCH_CANDIDATES.includes(search.toUpperCase() as typeof PROVIDER_SEARCH_CANDIDATES[number])
    ? (search.toUpperCase() as Provider)
    : undefined;

  const where = {
    projectId: query.projectId ? query.projectId : { in: projectIds },
    ...(query.provider ? { provider: query.provider } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(search
      ? {
          OR: [
            { model: { contains: search, mode: "insensitive" as const } },
            ...(searchProvider ? [{ provider: searchProvider }] : []),
          ],
        }
      : {}),
  };

  const [items, total, aggregates] = await Promise.all([
    prisma.gatewayLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        project: {
          select: {
            id: true,
            name: true,
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.gatewayLog.count({ where }),
    prisma.gatewayLog.aggregate({
      where,
      _sum: { estimatedCost: true },
      _count: { _all: true },
    }),
  ]);

  const successCount = await prisma.gatewayLog.count({
    where: { ...where, status: "SUCCESS" },
  });

  return {
    items,
    meta: {
      ...buildPaginationMeta(total, page, limit),
      totalSpend: Number(aggregates._sum.estimatedCost ?? 0),
      totalCount: total,
      successCount,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
    },
  };
}

export async function getProjectGatewayAnalytics(userId: string, projectId: string) {
  await assertProjectAccess(userId, projectId);

  const [summary, requestHistory, providerUsage, costHistory, latencyHistory] = await Promise.all([
    prisma.gatewayLog.aggregate({
      where: { projectId },
      _count: { _all: true },
      _avg: { estimatedCost: true, latency: true },
      _sum: { estimatedCost: true },
    }),
    prisma.gatewayLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        project: {
          select: {
            id: true,
            name: true,
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.gatewayLog.groupBy({
      by: ["provider"],
      where: { projectId },
      _count: { provider: true },
      _sum: { estimatedCost: true },
      _avg: { latency: true },
      orderBy: { _sum: { estimatedCost: "desc" } },
    }),
    prisma.$queryRaw<Array<{ day: Date; cost: Prisma.Decimal }>>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt")::date AS day, COALESCE(SUM("estimatedCost"), 0) AS cost
      FROM "GatewayLog"
      WHERE "projectId" = ${projectId}
      GROUP BY 1
      ORDER BY 1 ASC
    `),
    prisma.$queryRaw<Array<{ day: Date; latency: number }>>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt")::date AS day, COALESCE(AVG("latency"), 0) AS latency
      FROM "GatewayLog"
      WHERE "projectId" = ${projectId}
      GROUP BY 1
      ORDER BY 1 ASC
    `),
  ]);

  return {
    totalRequests: summary._count._all,
    averageCost: Number(summary._avg.estimatedCost ?? 0),
    averageLatency: Number(summary._avg.latency ?? 0),
    totalSpend: Number(summary._sum.estimatedCost ?? 0),
    requestHistory: requestHistory,
    providerUsage: providerUsage.map((row) => ({
      provider: row.provider,
      requests: row._count.provider,
      totalSpend: Number(row._sum.estimatedCost ?? 0),
      averageLatency: Number(row._avg.latency ?? 0),
    })),
    costHistory: costHistory.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      cost: Number(row.cost ?? 0),
    })),
    latencyHistory: latencyHistory.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      latency: Number(row.latency ?? 0),
    })),
  };
}
