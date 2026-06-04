import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { buildPaginationMeta, parsePaginationQuery } from "@/utils/pagination";
import { assertProjectAccess, getAccessibleProjectIds } from "@/services/project.service";
import type { PaginationQuery } from "@/types/api.types";

type BudgetListQuery = PaginationQuery & {
  organizationId?: string;
};

async function sumProjectUsage(projectId: string, client: typeof prisma | Prisma.TransactionClient = prisma): Promise<Prisma.Decimal> {
  const rows = await client.$queryRaw<Array<{ total: Prisma.Decimal }>>(Prisma.sql`
    SELECT COALESCE(SUM(COALESCE("cost", "estimatedCost")), 0) AS total
    FROM "UsageLog"
    WHERE "projectId" = ${projectId}
  `);

  return rows?.[0]?.total ?? new Prisma.Decimal(0);
}

export async function recalculateProjectBudget(
  projectId: string,
  client: typeof prisma | Prisma.TransactionClient = prisma,
): Promise<void> {
  const budget = await client.budget.findUnique({ where: { projectId } });

  if (!budget) {
    return;
  }

  const currentSpend = await sumProjectUsage(projectId, client);
  const remainingBudget = new Prisma.Decimal(budget.monthlyBudget).minus(currentSpend);

  await client.budget.update({
    where: { projectId },
    data: {
      currentSpend,
      remainingBudget,
    },
  });
}

export async function listBudgets(userId: string, query: BudgetListQuery) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(query, {
    defaultSortBy: "createdAt",
    allowedSortBy: ["monthlyBudget", "currentSpend", "remainingBudget", "createdAt", "updatedAt"],
  });

  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return { items: [], meta: buildPaginationMeta(0, page, limit) };
  }

  const filteredProjectIds = query.organizationId
    ? (await prisma.project.findMany({
        where: { id: { in: projectIds }, organizationId: query.organizationId },
        select: { id: true },
      })).map((project) => project.id)
    : projectIds;

  if (filteredProjectIds.length === 0) {
    return { items: [], meta: buildPaginationMeta(0, page, limit) };
  }

  const where = {
    projectId: { in: filteredProjectIds },
    ...(search
      ? {
          project: {
            is: {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
              ],
            },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.budget.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.budget.count({ where }),
  ]);

  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function createBudget(
  userId: string,
  input: { projectId: string; monthlyBudget: number; alertThreshold?: number },
) {
  await assertProjectAccess(userId, input.projectId);

  const existingBudget = await prisma.budget.findUnique({ where: { projectId: input.projectId } });

  if (existingBudget) {
    throw new AppError("A budget already exists for this project", 409);
  }

  const currentSpend = await sumProjectUsage(input.projectId);
  const monthlyBudget = new Prisma.Decimal(input.monthlyBudget);

  return prisma.budget.create({
    data: {
      projectId: input.projectId,
      monthlyBudget,
      currentSpend,
      remainingBudget: monthlyBudget.minus(currentSpend),
      alertThreshold: input.alertThreshold ?? 80,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
}

export async function getBudgetById(userId: string, budgetId: string) {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      project: {
        select: {
          id: true,
          organizationId: true,
          name: true,
          description: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!budget) {
    throw new AppError("Budget not found", 404);
  }

  await assertProjectAccess(userId, budget.projectId);

  return budget;
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  input: { projectId?: string; monthlyBudget?: number; currentSpend?: number; alertThreshold?: number },
) {
  const budget = await prisma.budget.findUnique({ where: { id: budgetId } });

  if (!budget) {
    throw new AppError("Budget not found", 404);
  }

  await assertProjectAccess(userId, budget.projectId);

  if (input.projectId && input.projectId !== budget.projectId) {
    await assertProjectAccess(userId, input.projectId);
  }

  const projectId = input.projectId ?? budget.projectId;
  const monthlyBudget = new Prisma.Decimal(input.monthlyBudget ?? budget.monthlyBudget);
  const currentSpend = input.currentSpend !== undefined
    ? new Prisma.Decimal(input.currentSpend)
    : await sumProjectUsage(projectId);

  return prisma.budget.update({
    where: { id: budgetId },
    data: {
      projectId,
      monthlyBudget,
      currentSpend,
      remainingBudget: monthlyBudget.minus(currentSpend),
      alertThreshold: input.alertThreshold ?? budget.alertThreshold,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
}

export async function deleteBudget(userId: string, budgetId: string) {
  const budget = await prisma.budget.findUnique({ where: { id: budgetId } });

  if (!budget) {
    throw new AppError("Budget not found", 404);
  }

  await assertProjectAccess(userId, budget.projectId);

  return prisma.budget.delete({ where: { id: budgetId } });
}
