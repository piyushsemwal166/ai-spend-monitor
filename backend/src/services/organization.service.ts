import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { buildPaginationMeta, parsePaginationQuery } from "@/utils/pagination";
import type { PaginationQuery } from "@/types/api.types";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80) || "organization";
}

async function generateUniqueSlug(name: string, excludeOrganizationId?: string): Promise<string> {
  const baseSlug = slugify(name);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const existing = await prisma.organization.findFirst({
      where: excludeOrganizationId ? { slug: candidate, NOT: { id: excludeOrganizationId } } : { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function getAccessibleOrganizationIds(userId: string): Promise<string[]> {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true },
  });

  return memberships.map((membership) => membership.organizationId);
}

export async function assertOrganizationAccess(
  userId: string,
  organizationId: string,
  roles?: Array<"OWNER" | "ADMIN" | "MEMBER">,
) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId },
    select: { role: true, organizationId: true, userId: true },
  });

  if (!membership) {
    throw new AppError("You do not have access to this organization", 403);
  }

  if (roles && !roles.includes(membership.role)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  return membership;
}

export async function listOrganizations(userId: string, query: PaginationQuery) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(query, {
    defaultSortBy: "createdAt",
    allowedSortBy: ["name", "slug", "createdAt", "updatedAt"],
  });

  const where = {
    members: { some: { userId } },
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: { select: { members: true, projects: true } },
      },
    }),
    prisma.organization.count({ where }),
  ]);

  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function createOrganization(userId: string, input: { name: string; description?: string | null }) {
  const slug = await generateUniqueSlug(input.name);

  const organization = await prisma.organization.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return organization;
}

export async function getOrganizationById(userId: string, organizationId: string) {
  await assertOrganizationAccess(userId, organizationId);

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      _count: { select: { members: true, projects: true } },
      members: {
        select: {
          role: true,
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
          },
        },
      },
    },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  return organization;
}

export async function updateOrganization(
  userId: string,
  organizationId: string,
  input: { name?: string; description?: string | null },
) {
  await assertOrganizationAccess(userId, organizationId, ["OWNER", "ADMIN"]);

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const nextName = input.name ?? organization.name;
  const nextSlug = input.name ? await generateUniqueSlug(nextName, organizationId) : organization.slug;

  return prisma.organization.update({
    where: { id: organizationId },
    data: {
      name: input.name ?? organization.name,
      slug: nextSlug,
      description: input.description ?? organization.description,
    },
  });
}

export async function deleteOrganization(userId: string, organizationId: string) {
  await assertOrganizationAccess(userId, organizationId, ["OWNER", "ADMIN"]);

  return prisma.organization.delete({
    where: { id: organizationId },
  });
}
