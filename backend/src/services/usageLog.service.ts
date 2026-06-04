import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { buildPaginationMeta, parsePaginationQuery } from "@/utils/pagination";
import { assertProjectAccess, getAccessibleProjectIds } from "@/services/project.service";
import { recalculateProjectBudget } from "@/services/budget.service";
import type { PaginationQuery } from "@/types/api.types";

type UsageLogListQuery = PaginationQuery & {
  projectId?: string;
};

export async function listUsageLogs(userId: string, query: UsageLogListQuery) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(query, {
    defaultSortBy: "createdAt",
    allowedSortBy: ["model", "provider", "tokens", "cost", "requestCount", "createdAt"],
  });

  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return { items: [], meta: buildPaginationMeta(0, page, limit) };
  }

  const providerCandidates = ["GEMINI", "OPENAI", "ANTHROPIC", "GOOGLE", "AZURE"] as const;
  const normalizedSearch = typeof search === "string" ? search.trim().toUpperCase() : null;
  const providerClause = normalizedSearch && providerCandidates.includes(normalizedSearch as any)
    ? { provider: normalizedSearch as "GEMINI" | "OPENAI" | "ANTHROPIC" | "GOOGLE" | "AZURE" }
    : null;

  const orClauses: any[] = [];
  if (search) {
    orClauses.push({ model: { contains: search, mode: "insensitive" as const } });
    if (providerClause) orClauses.push(providerClause);
  }

  const where = {
    projectId: { in: projectIds },
    ...(query.projectId ? { projectId: query.projectId } : {}),
    ...(orClauses.length ? { OR: orClauses } : {}),
  };

  const [items, total, aggregates] = await Promise.all([
    prisma.usageLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.usageLog.count({ where }),
    prisma.usageLog.aggregate({
      where,
      _sum: { estimatedCost: true, totalTokens: true },
      _count: { requestCount: true },
    }),
  ]);

  return {
    items,
    meta: {
      ...buildPaginationMeta(total, page, limit),
      totalSpend: Number(aggregates._sum.estimatedCost ?? 0),
      totalRequests: aggregates._count.requestCount ?? 0,
      totalTokens: Number(aggregates._sum.totalTokens ?? 0),
    },
  };
}

export async function createUsageLog(
  userId: string,
  input: {
    projectId: string;
    organizationId?: string;
    teamId?: string | null;
    userId?: string;
    model: string;
    provider: "GEMINI" | "OPENAI" | "ANTHROPIC" | "GOOGLE" | "AZURE";
    tokens: number;
    cost: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    estimatedCost?: number;
    requestCount?: number;
  },
  client: typeof prisma | Prisma.TransactionClient = prisma,
) {
  await assertProjectAccess(userId, input.projectId);

  const [project, userMembership] = await Promise.all([
    input.organizationId ? Promise.resolve({ organizationId: input.organizationId }) : prisma.project.findUnique({ where: { id: input.projectId }, select: { organizationId: true } }),
    input.teamId !== undefined ? Promise.resolve({ teamId: input.teamId }) : prisma.user.findUnique({ where: { id: input.userId ?? userId }, select: { teamId: true } }),
  ]);

  const usageLog = await client.usageLog.create({
    data: {
      projectId: input.projectId,
      organizationId: project?.organizationId ?? null,
      teamId: input.teamId !== undefined ? input.teamId : userMembership?.teamId ?? null,
      userId: input.userId,
      model: input.model,
      provider: input.provider,
      tokens: input.tokens,
      cost: new Prisma.Decimal(input.cost),
      inputTokens: input.inputTokens ?? input.tokens,
      outputTokens: input.outputTokens ?? 0,
      totalTokens: input.totalTokens ?? input.tokens,
      estimatedCost: new Prisma.Decimal(input.estimatedCost ?? input.cost),
      requestCount: input.requestCount ?? 1,
    },
  });

  await recalculateProjectBudget(input.projectId, client);

  return usageLog;
}

export async function getUsageLogById(userId: string, usageLogId: string) {
  const usageLog = await prisma.usageLog.findUnique({
    where: { id: usageLogId },
    include: {
      project: {
        select: {
          id: true,
          organizationId: true,
          name: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!usageLog) {
    throw new AppError("Usage log not found", 404);
  }

  await assertProjectAccess(userId, usageLog.projectId);

  return usageLog;
}

export async function updateUsageLog(
  userId: string,
  usageLogId: string,
  input: {
    projectId?: string;
    userId?: string;
    teamId?: string | null;
    model?: string;
    provider?: "GEMINI" | "OPENAI" | "ANTHROPIC" | "GOOGLE" | "AZURE";
    tokens?: number;
    cost?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    estimatedCost?: number;
    requestCount?: number;
  },
) {
  const currentUsageLog = await prisma.usageLog.findUnique({ where: { id: usageLogId } });

  if (!currentUsageLog) {
    throw new AppError("Usage log not found", 404);
  }

  await assertProjectAccess(userId, currentUsageLog.projectId);

  if (input.projectId && input.projectId !== currentUsageLog.projectId) {
    await assertProjectAccess(userId, input.projectId);
  }

  const nextProjectId = input.projectId ?? currentUsageLog.projectId;
  const nextProject = input.projectId && input.projectId !== currentUsageLog.projectId
    ? await prisma.project.findUnique({ where: { id: nextProjectId }, select: { organizationId: true } })
    : null;

  const updatedUsageLog = await prisma.$transaction(async (tx) => {
    const updated = await tx.usageLog.update({
      where: { id: usageLogId },
      data: {
        projectId: nextProjectId,
        organizationId: nextProject?.organizationId ?? currentUsageLog.organizationId,
        teamId: input.teamId !== undefined ? input.teamId : currentUsageLog.teamId,
        userId: input.userId ?? currentUsageLog.userId,
        model: input.model ?? currentUsageLog.model,
        provider: input.provider ?? currentUsageLog.provider,
        tokens: input.tokens ?? currentUsageLog.tokens,
        cost: input.cost !== undefined ? new Prisma.Decimal(input.cost) : currentUsageLog.cost,
        inputTokens: input.inputTokens ?? input.tokens ?? currentUsageLog.inputTokens,
        outputTokens: input.outputTokens ?? currentUsageLog.outputTokens,
        totalTokens: input.totalTokens ?? input.tokens ?? currentUsageLog.totalTokens,
        estimatedCost:
          input.estimatedCost !== undefined
            ? new Prisma.Decimal(input.estimatedCost)
            : input.cost !== undefined
              ? new Prisma.Decimal(input.cost)
              : currentUsageLog.estimatedCost,
        requestCount: input.requestCount ?? currentUsageLog.requestCount,
      },
    });

    await recalculateProjectBudget(currentUsageLog.projectId, tx);

    if (nextProjectId !== currentUsageLog.projectId) {
      await recalculateProjectBudget(nextProjectId, tx);
    }

    return updated;
  });

  return updatedUsageLog;
}

export async function deleteUsageLog(userId: string, usageLogId: string) {
  const usageLog = await prisma.usageLog.findUnique({ where: { id: usageLogId } });

  if (!usageLog) {
    throw new AppError("Usage log not found", 404);
  }

  await assertProjectAccess(userId, usageLog.projectId);

  return prisma.$transaction(async (tx) => {
    const deleted = await tx.usageLog.delete({ where: { id: usageLogId } });
    await recalculateProjectBudget(usageLog.projectId, tx);
    return deleted;
  });
}
