import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { buildPaginationMeta, parsePaginationQuery } from "@/utils/pagination";
import { assertOrganizationAccess, getAccessibleOrganizationIds } from "@/services/organization.service";
import type { PaginationQuery } from "@/types/api.types";

export type TeamBudgetListQuery = PaginationQuery & {
  organizationId?: string;
};

async function sumTeamUsage(teamId: string, client: typeof prisma | Prisma.TransactionClient = prisma): Promise<Prisma.Decimal> {
  const rows = await client.$queryRaw<Array<{ total: Prisma.Decimal }>>(Prisma.sql`
    SELECT COALESCE(SUM(COALESCE(l."estimatedCost", l.cost)), 0) AS total
    FROM "UsageLog" l
    WHERE l."teamId" = ${teamId}
  `);

  return rows?.[0]?.total ?? new Prisma.Decimal(0);
}

export async function recalculateTeamBudget(teamId: string, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const budget = await client.teamBudget.findUnique({ where: { teamId } });
  if (!budget) {
    return;
  }

  const currentSpend = await sumTeamUsage(teamId, client);
  const remainingBudget = new Prisma.Decimal(budget.monthlyBudget).minus(currentSpend);

  await client.teamBudget.update({
    where: { teamId },
    data: { currentSpend, remainingBudget },
  });
}

export async function listTeamBudgets(userId: string, query: TeamBudgetListQuery) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(query, {
    defaultSortBy: "createdAt",
    allowedSortBy: ["monthlyBudget", "currentSpend", "remainingBudget", "createdAt", "updatedAt"],
  });

  const organizationIds = await getAccessibleOrganizationIds(userId);
  if (organizationIds.length === 0) {
    return { items: [], meta: buildPaginationMeta(0, page, limit) };
  }

  const filteredOrganizationIds = query.organizationId
    ? organizationIds.filter((organizationId) => organizationId === query.organizationId)
    : organizationIds;

  if (filteredOrganizationIds.length === 0) {
    return { items: [], meta: buildPaginationMeta(0, page, limit) };
  }

  const where = {
    team: { organizationId: { in: filteredOrganizationIds } },
    ...(search
      ? {
          team: {
            is: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.teamBudget.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.teamBudget.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function createTeamBudget(
  userId: string,
  input: { teamId: string; monthlyBudget: number; alertThreshold?: number },
) {
  const team = await prisma.team.findUnique({ where: { id: input.teamId }, select: { id: true, organizationId: true, name: true } });
  if (!team) {
    throw new AppError("Team not found", 404);
  }

  await assertOrganizationAccess(userId, team.organizationId, ["OWNER", "ADMIN"]);

  const existingBudget = await prisma.teamBudget.findUnique({ where: { teamId: input.teamId } });
  if (existingBudget) {
    throw new AppError("A budget already exists for this team", 409);
  }

  const currentSpend = await sumTeamUsage(input.teamId);
  const monthlyBudget = new Prisma.Decimal(input.monthlyBudget);

  return prisma.teamBudget.create({
    data: {
      teamId: input.teamId,
      monthlyBudget,
      currentSpend,
      remainingBudget: monthlyBudget.minus(currentSpend),
      alertThreshold: input.alertThreshold ?? 80,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
}

export async function getTeamBudgetById(userId: string, budgetId: string) {
  const budget = await prisma.teamBudget.findUnique({
    where: { id: budgetId },
    include: {
      team: {
        select: {
          id: true,
          organizationId: true,
          name: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!budget) {
    throw new AppError("Team budget not found", 404);
  }

  await assertOrganizationAccess(userId, budget.team.organizationId);
  return budget;
}

export async function updateTeamBudget(
  userId: string,
  budgetId: string,
  input: { teamId?: string; monthlyBudget?: number; currentSpend?: number; alertThreshold?: number },
) {
  const budget = await prisma.teamBudget.findUnique({
    where: { id: budgetId },
    include: { team: { select: { id: true, organizationId: true } } },
  });

  if (!budget) {
    throw new AppError("Team budget not found", 404);
  }

  await assertOrganizationAccess(userId, budget.team.organizationId, ["OWNER", "ADMIN"]);

  const nextTeamId = input.teamId ?? budget.teamId;
  if (nextTeamId !== budget.teamId) {
    const nextTeam = await prisma.team.findUnique({ where: { id: nextTeamId }, select: { id: true, organizationId: true } });
    if (!nextTeam) {
      throw new AppError("Team not found", 404);
    }
    await assertOrganizationAccess(userId, nextTeam.organizationId, ["OWNER", "ADMIN"]);
  }

  const monthlyBudget = new Prisma.Decimal(input.monthlyBudget ?? budget.monthlyBudget);
  const currentSpend = input.currentSpend !== undefined ? new Prisma.Decimal(input.currentSpend) : await sumTeamUsage(nextTeamId);

  return prisma.teamBudget.update({
    where: { id: budgetId },
    data: {
      teamId: nextTeamId,
      monthlyBudget,
      currentSpend,
      remainingBudget: monthlyBudget.minus(currentSpend),
      alertThreshold: input.alertThreshold ?? budget.alertThreshold,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
}

export async function deleteTeamBudget(userId: string, budgetId: string) {
  const budget = await prisma.teamBudget.findUnique({
    where: { id: budgetId },
    include: { team: { select: { organizationId: true } } },
  });

  if (!budget) {
    throw new AppError("Team budget not found", 404);
  }

  await assertOrganizationAccess(userId, budget.team.organizationId, ["OWNER", "ADMIN"]);

  return prisma.teamBudget.delete({ where: { id: budgetId } });
}
