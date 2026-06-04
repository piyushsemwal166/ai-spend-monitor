import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { getAccessibleOrganizationIds } from "@/services/organization.service";
import { getAccessibleProjectIds, assertProjectAccess } from "@/services/project.service";

export async function getAnalyticsOverview(userId: string) {
  const organizationIds = await getAccessibleOrganizationIds(userId);
  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return {
      totalSpend: 0,
      totalRequests: 0,
      totalTokens: 0,
      activeUsers: 0,
      activeProjects: 0,
    };
  }

  const [totals, activeUsers, activeProjects] = await Promise.all([
    prisma.usageLog.aggregate({
      where: { organizationId: { in: organizationIds } },
      _sum: { estimatedCost: true, totalTokens: true },
      _count: { _all: true },
    }),
    prisma.user.count({
      where: {
        usageLogs: { some: { organizationId: { in: organizationIds } } },
      },
    }),
    prisma.project.count({ where: { id: { in: projectIds } } }),
  ]);

  return {
    totalSpend: Number(totals._sum.estimatedCost ?? 0),
    totalRequests: totals._count._all,
    totalTokens: Number(totals._sum.totalTokens ?? 0),
    activeUsers,
    activeProjects,
  };
}

export async function getTopUsers(userId: string) {
  const organizationIds = await getAccessibleOrganizationIds(userId);
  if (organizationIds.length === 0) return [];

  const rows = await prisma.$queryRaw<Array<{ id: string; name: string; email: string; totalSpend: Prisma.Decimal; totalRequests: bigint; totalTokens: bigint }>>(Prisma.sql`
    SELECT u.id, u.name, u.email,
           COALESCE(SUM(COALESCE(l."estimatedCost", l.cost)), 0) AS "totalSpend",
           COUNT(*)::bigint AS "totalRequests",
           COALESCE(SUM(l."totalTokens"), 0)::bigint AS "totalTokens"
    FROM "UsageLog" l
    INNER JOIN "User" u ON u.id = l."userId"
    WHERE l."organizationId" IN (${Prisma.join(organizationIds)})
    GROUP BY u.id, u.name, u.email
    ORDER BY "totalSpend" DESC, "totalRequests" DESC
    LIMIT 10
  `);

  return rows.map((row) => ({
    user: { id: row.id, name: row.name, email: row.email },
    totalSpend: Number(row.totalSpend ?? 0),
    totalRequests: Number(row.totalRequests ?? 0),
    totalTokens: Number(row.totalTokens ?? 0),
  }));
}

export async function getTopTeams(userId: string) {
  const organizationIds = await getAccessibleOrganizationIds(userId);
  if (organizationIds.length === 0) return [];

  const rows = await prisma.$queryRaw<Array<{ id: string | null; name: string | null; totalSpend: Prisma.Decimal; totalRequests: bigint; totalTokens: bigint }>>(Prisma.sql`
    SELECT t.id, t.name,
           COALESCE(SUM(COALESCE(l."estimatedCost", l.cost)), 0) AS "totalSpend",
           COUNT(*)::bigint AS "totalRequests",
           COALESCE(SUM(l."totalTokens"), 0)::bigint AS "totalTokens"
    FROM "UsageLog" l
    LEFT JOIN "Team" t ON t.id = l."teamId"
    WHERE l."organizationId" IN (${Prisma.join(organizationIds)})
    GROUP BY t.id, t.name
    ORDER BY "totalSpend" DESC, "totalRequests" DESC
    LIMIT 10
  `);

  return rows.map((row) => ({
    team: { id: row.id, name: row.name ?? "Unassigned" },
    totalSpend: Number(row.totalSpend ?? 0),
    totalRequests: Number(row.totalRequests ?? 0),
    totalTokens: Number(row.totalTokens ?? 0),
  }));
}

export async function getTopProjects(userId: string) {
  const projectIds = await getAccessibleProjectIds(userId);
  if (projectIds.length === 0) return [];

  const rows = await prisma.$queryRaw<Array<{ id: string; name: string; totalSpend: Prisma.Decimal; totalRequests: bigint; totalTokens: bigint }>>(Prisma.sql`
    SELECT p.id, p.name,
           COALESCE(SUM(COALESCE(l."estimatedCost", l.cost)), 0) AS "totalSpend",
           COUNT(*)::bigint AS "totalRequests",
           COALESCE(SUM(l."totalTokens"), 0)::bigint AS "totalTokens"
    FROM "UsageLog" l
    INNER JOIN "Project" p ON p.id = l."projectId"
    WHERE p.id IN (${Prisma.join(projectIds)})
    GROUP BY p.id, p.name
    ORDER BY "totalSpend" DESC, "totalRequests" DESC
    LIMIT 10
  `);

  return rows.map((row) => ({
    project: { id: row.id, name: row.name },
    totalSpend: Number(row.totalSpend ?? 0),
    totalRequests: Number(row.totalRequests ?? 0),
    totalTokens: Number(row.totalTokens ?? 0),
  }));
}

export async function getModelAnalytics(userId: string) {
  const organizationIds = await getAccessibleOrganizationIds(userId);
  if (organizationIds.length === 0) return [];

  const rows = await prisma.$queryRaw<Array<{ model: string; totalUsage: bigint; totalSpend: Prisma.Decimal; tokenCount: bigint }>>(Prisma.sql`
    SELECT l.model,
           COUNT(*)::bigint AS "totalUsage",
           COALESCE(SUM(COALESCE(l."estimatedCost", l.cost)), 0) AS "totalSpend",
           COALESCE(SUM(l."totalTokens"), 0)::bigint AS "tokenCount"
    FROM "UsageLog" l
    WHERE l."organizationId" IN (${Prisma.join(organizationIds)})
    GROUP BY l.model
    ORDER BY "totalSpend" DESC, "totalUsage" DESC
  `);

  return rows.map((row) => ({
    model: row.model,
    totalUsage: Number(row.totalUsage ?? 0),
    totalSpend: Number(row.totalSpend ?? 0),
    tokenCount: Number(row.tokenCount ?? 0),
  }));
}

export async function getProjectAnalytics(userId: string, projectId: string) {
  await assertProjectAccess(userId, projectId);

  const [summary, dailyRequests, dailyCost, modelUsage] = await Promise.all([
    prisma.usageLog.aggregate({
      where: { projectId },
      _sum: { estimatedCost: true, totalTokens: true },
      _count: { _all: true },
    }),
    prisma.$queryRaw<Array<{ day: Date; requests: bigint }>>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::bigint AS requests
      FROM "UsageLog"
      WHERE "projectId" = ${projectId}
      GROUP BY 1
      ORDER BY 1 ASC
    `),
    prisma.$queryRaw<Array<{ day: Date; spend: Prisma.Decimal }>>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt")::date AS day, COALESCE(SUM(COALESCE("estimatedCost", cost)), 0) AS spend
      FROM "UsageLog"
      WHERE "projectId" = ${projectId}
      GROUP BY 1
      ORDER BY 1 ASC
    `),
    prisma.usageLog.groupBy({
      by: ["model"],
      where: { projectId },
      _count: { model: true },
      _sum: { estimatedCost: true, totalTokens: true },
      orderBy: { _count: { model: "desc" } },
    }),
  ]);

  return {
    spend: Number(summary._sum.estimatedCost ?? 0),
    requests: summary._count._all,
    tokens: Number(summary._sum.totalTokens ?? 0),
    dailyRequests: dailyRequests.map((row) => ({ date: row.day.toISOString().slice(0, 10), requests: Number(row.requests ?? 0) })),
    dailyCost: dailyCost.map((row) => ({ date: row.day.toISOString().slice(0, 10), spend: Number(row.spend ?? 0) })),
    modelUsage: modelUsage.map((row) => ({
      model: row.model,
      usage: row._count.model,
      spend: Number(row._sum.estimatedCost ?? 0),
      tokens: Number(row._sum.totalTokens ?? 0),
    })),
  };
}
