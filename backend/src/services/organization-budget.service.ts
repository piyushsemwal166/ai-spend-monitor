import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { buildPaginationMeta, parsePaginationQuery } from "@/utils/pagination";
import { assertOrganizationAccess, getAccessibleOrganizationIds } from "@/services/organization.service";
import type { PaginationQuery } from "@/types/api.types";

export type OrganizationBudgetListQuery = PaginationQuery & {
  organizationId?: string;
};

async function sumOrganizationUsage(organizationId: string, client: typeof prisma | Prisma.TransactionClient = prisma): Promise<Prisma.Decimal> {
  const rows = await client.$queryRaw<Array<{ total: Prisma.Decimal }>>(Prisma.sql`
    SELECT COALESCE(SUM(COALESCE(l."estimatedCost", l.cost)), 0) AS total
    FROM "UsageLog" l
    WHERE l."organizationId" = ${organizationId}
  `);

  return rows?.[0]?.total ?? new Prisma.Decimal(0);
}

export async function recalculateOrganizationBudget(organizationId: string, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const budget = await client.organizationBudget.findUnique({ where: { organizationId } });
  if (!budget) {
    return;
  }

  const currentSpend = await sumOrganizationUsage(organizationId, client);
  const remainingBudget = new Prisma.Decimal(budget.monthlyBudget).minus(currentSpend);

  await client.organizationBudget.update({
    where: { organizationId },
    data: { currentSpend, remainingBudget },
  });
}

export async function listOrganizationBudgets(userId: string, query: OrganizationBudgetListQuery) {
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
    organizationId: { in: filteredOrganizationIds },
    ...(search
      ? {
          organization: {
            is: {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { slug: { contains: search, mode: "insensitive" as const } },
              ],
            },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.organizationBudget.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, description: true },
        },
      },
    }),
    prisma.organizationBudget.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function createOrganizationBudget(
  userId: string,
  input: { organizationId: string; monthlyBudget: number; alertThreshold?: number },
) {
  const organization = await prisma.organization.findUnique({ where: { id: input.organizationId }, select: { id: true, name: true } });
  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  await assertOrganizationAccess(userId, input.organizationId, ["OWNER", "ADMIN"]);

  const existingBudget = await prisma.organizationBudget.findUnique({ where: { organizationId: input.organizationId } });
  if (existingBudget) {
    throw new AppError("A budget already exists for this organization", 409);
  }

  const currentSpend = await sumOrganizationUsage(input.organizationId);
  const monthlyBudget = new Prisma.Decimal(input.monthlyBudget);

  return prisma.organizationBudget.create({
    data: {
      organizationId: input.organizationId,
      monthlyBudget,
      currentSpend,
      remainingBudget: monthlyBudget.minus(currentSpend),
      alertThreshold: input.alertThreshold ?? 80,
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, description: true },
      },
    },
  });
}

export async function getOrganizationBudgetById(userId: string, budgetId: string) {
  const budget = await prisma.organizationBudget.findUnique({
    where: { id: budgetId },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, description: true },
      },
    },
  });

  if (!budget) {
    throw new AppError("Organization budget not found", 404);
  }

  await assertOrganizationAccess(userId, budget.organizationId);
  return budget;
}

export async function updateOrganizationBudget(
  userId: string,
  budgetId: string,
  input: { organizationId?: string; monthlyBudget?: number; currentSpend?: number; alertThreshold?: number },
) {
  const budget = await prisma.organizationBudget.findUnique({
    where: { id: budgetId },
    include: { organization: { select: { id: true } } },
  });

  if (!budget) {
    throw new AppError("Organization budget not found", 404);
  }

  await assertOrganizationAccess(userId, budget.organizationId, ["OWNER", "ADMIN"]);

  const nextOrganizationId = input.organizationId ?? budget.organizationId;
  if (nextOrganizationId !== budget.organizationId) {
    await assertOrganizationAccess(userId, nextOrganizationId, ["OWNER", "ADMIN"]);
  }

  const monthlyBudget = new Prisma.Decimal(input.monthlyBudget ?? budget.monthlyBudget);
  const currentSpend = input.currentSpend !== undefined ? new Prisma.Decimal(input.currentSpend) : await sumOrganizationUsage(nextOrganizationId);

  return prisma.organizationBudget.update({
    where: { id: budgetId },
    data: {
      organizationId: nextOrganizationId,
      monthlyBudget,
      currentSpend,
      remainingBudget: monthlyBudget.minus(currentSpend),
      alertThreshold: input.alertThreshold ?? budget.alertThreshold,
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, description: true },
      },
    },
  });
}

export async function deleteOrganizationBudget(userId: string, budgetId: string) {
  const budget = await prisma.organizationBudget.findUnique({
    where: { id: budgetId },
  });

  if (!budget) {
    throw new AppError("Organization budget not found", 404);
  }

  await assertOrganizationAccess(userId, budget.organizationId, ["OWNER", "ADMIN"]);

  return prisma.organizationBudget.delete({ where: { id: budgetId } });
}
