import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { getAccessibleProjectIds } from "@/services/project.service";

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function startOfMonth(date: Date): Date {
  const normalized = new Date(date);
  normalized.setDate(1);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function subtractMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

export async function getDashboardSummary(userId: string) {
  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return {
      todaySpend: 0,
      monthlySpend: 0,
      remainingBudget: 0,
      totalProjects: 0,
      totalRequests: 0,
      totalTokens: 0,
      estimatedCost: 0,
      mostUsedModel: null,
    };
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = startOfMonth(now);

  const [todaySpend, monthlySpend, remainingBudget, totalProjects, totalRequests, tokenSum, spendSum, mostUsedModelRows] = await Promise.all([
    prisma.usageLog.aggregate({
      where: { projectId: { in: projectIds }, createdAt: { gte: todayStart, lt: tomorrow } },
      _sum: { estimatedCost: true },
    }),
    prisma.usageLog.aggregate({
      where: { projectId: { in: projectIds }, createdAt: { gte: monthStart } },
      _sum: { estimatedCost: true },
    }),
    prisma.budget.aggregate({
      where: { projectId: { in: projectIds } },
      _sum: { remainingBudget: true },
    }),
    prisma.project.count({ where: { id: { in: projectIds } } }),
    prisma.usageLog.count({ where: { projectId: { in: projectIds } } }),
    prisma.usageLog.aggregate({ where: { projectId: { in: projectIds } }, _sum: { totalTokens: true } }),
    prisma.usageLog.aggregate({ where: { projectId: { in: projectIds } }, _sum: { estimatedCost: true } }),
    prisma.usageLog.groupBy({
      by: ["model"],
      where: { projectId: { in: projectIds } },
      _count: { model: true },
      orderBy: { _count: { model: "desc" } },
      take: 1,
    }),
  ]);

  return {
    todaySpend: Number(todaySpend._sum.estimatedCost ?? 0),
    monthlySpend: Number(monthlySpend._sum.estimatedCost ?? 0),
    remainingBudget: Number(remainingBudget._sum.remainingBudget ?? 0),
    totalProjects,
    totalRequests,
    totalTokens: Number(tokenSum._sum.totalTokens ?? 0),
    estimatedCost: Number(spendSum._sum.estimatedCost ?? 0),
    mostUsedModel: mostUsedModelRows[0]?.model ?? null,
  };
}

export async function getDailySpendSeries(userId: string) {
  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return [];
  }

  const startDate = startOfDay(subtractDays(new Date(), 6));

  const rows = await prisma.$queryRaw<Array<{ date: Date; spend: Prisma.Decimal }>>(Prisma.sql`
    SELECT DATE_TRUNC('day', "createdAt")::date AS date,
           COALESCE(SUM(cost), 0) AS spend
    FROM "UsageLog"
    WHERE "projectId" IN (${Prisma.join(projectIds)})
      AND "createdAt" >= ${startDate}
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return rows.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    spend: Number(row.spend ?? 0),
  }));
}

export async function getMonthlySpendSeries(userId: string) {
  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return [];
  }

  const startDate = startOfMonth(subtractMonths(new Date(), 11));

  const rows = await prisma.$queryRaw<Array<{ month: Date; spend: Prisma.Decimal }>>(Prisma.sql`
    SELECT DATE_TRUNC('month', "createdAt")::date AS month,
           COALESCE(SUM(cost), 0) AS spend
    FROM "UsageLog"
    WHERE "projectId" IN (${Prisma.join(projectIds)})
      AND "createdAt" >= ${startDate}
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return rows.map((row) => ({
    month: row.month.toISOString().slice(0, 7),
    spend: Number(row.spend ?? 0),
  }));
}
