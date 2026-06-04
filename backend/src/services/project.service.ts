import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { buildPaginationMeta, parsePaginationQuery } from "@/utils/pagination";
import { assertOrganizationAccess, getAccessibleOrganizationIds } from "@/services/organization.service";
import type { PaginationQuery } from "@/types/api.types";

type ProjectListQuery = PaginationQuery & {
  organizationId?: string;
};

export async function getAccessibleProjectIds(userId: string): Promise<string[]> {
  const organizationIds = await getAccessibleOrganizationIds(userId);

  if (organizationIds.length === 0) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: { organizationId: { in: organizationIds } },
    select: { id: true },
  });

  return projects.map((project) => project.id);
}

export async function assertProjectAccess(userId: string, projectId: string) {
  const organizationIds = await getAccessibleOrganizationIds(userId);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId: { in: organizationIds },
    },
    select: { id: true, organizationId: true },
  });

  if (!project) {
    throw new AppError("You do not have access to this project", 403);
  }

  return project;
}

export async function listProjects(userId: string, query: ProjectListQuery) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(query, {
    defaultSortBy: "createdAt",
    allowedSortBy: ["name", "status", "createdAt", "updatedAt"],
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
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
        budget: true,
        _count: { select: { usageLogs: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function createProject(
  userId: string,
  input: { name: string; description?: string | null; organizationId: string; status?: "ACTIVE" | "PAUSED" | "ARCHIVED" },
) {
  await assertOrganizationAccess(userId, input.organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      organizationId: input.organizationId,
      status: input.status ?? "ACTIVE",
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function getProjectById(userId: string, projectId: string) {
  await assertProjectAccess(userId, projectId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, description: true },
      },
      budget: true,
      _count: { select: { usageLogs: true } },
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: { name?: string; description?: string | null; status?: "ACTIVE" | "PAUSED" | "ARCHIVED" },
) {
  await assertProjectAccess(userId, projectId);

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name ?? project.name,
      description: input.description ?? project.description,
      status: input.status ?? project.status,
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
      budget: true,
    },
  });
}

export async function deleteProject(userId: string, projectId: string) {
  await assertProjectAccess(userId, projectId);

  return prisma.project.delete({
    where: { id: projectId },
  });
}
