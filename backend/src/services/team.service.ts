import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { buildPaginationMeta, parsePaginationQuery } from "@/utils/pagination";
import { assertOrganizationAccess, getAccessibleOrganizationIds } from "@/services/organization.service";
import type { PaginationQuery } from "@/types/api.types";

type TeamListQuery = PaginationQuery & {
  organizationId?: string;
};

async function ensureUsersBelongToOrganization(organizationId: string, userIds: string[], client: typeof prisma | Prisma.TransactionClient = prisma) {
  if (userIds.length === 0) {
    return;
  }

  const members = await client.organizationMember.findMany({
    where: { organizationId, userId: { in: userIds } },
    select: { userId: true },
  });

  if (members.length !== userIds.length) {
    throw new AppError("One or more users do not belong to this organization", 400);
  }
}

async function syncTeamMembers(
  teamId: string,
  organizationId: string,
  ownerUserIds: string[],
  memberIds: string[] | undefined,
  client: typeof prisma | Prisma.TransactionClient = prisma,
) {
  if (!memberIds) {
    return;
  }

  const selectedIds = Array.from(new Set([...ownerUserIds, ...memberIds]));

  await ensureUsersBelongToOrganization(organizationId, selectedIds, client);

  await client.teamMember.deleteMany({
    where: {
      teamId,
      role: { not: "OWNER" },
      userId: { notIn: selectedIds },
    },
  });

  await client.user.updateMany({
    where: { teamId, NOT: { id: { in: selectedIds } } },
    data: { teamId: null },
  });

  await Promise.all(
    selectedIds.map((userId) =>
      client.teamMember.upsert({
        where: { userId },
        create: {
          teamId,
          userId,
          role: ownerUserIds.includes(userId) ? "OWNER" : "MEMBER",
        },
        update: {
          teamId,
          role: ownerUserIds.includes(userId) ? "OWNER" : "MEMBER",
        },
      }),
    ),
  );

  await client.user.updateMany({
    where: { id: { in: selectedIds } },
    data: { teamId },
  });
}

async function ensureTeamHasOwner(teamId: string, client: typeof prisma | Prisma.TransactionClient = prisma) {
  const ownerCount = await client.teamMember.count({
    where: { teamId, role: "OWNER" },
  });

  if (ownerCount > 0) {
    return;
  }

  const primaryMember = await client.teamMember.findFirst({
    where: { teamId },
    orderBy: { createdAt: "asc" },
    select: { userId: true },
  });

  if (!primaryMember) {
    return;
  }

  await client.teamMember.update({
    where: { userId: primaryMember.userId },
    data: { role: "OWNER" },
  });
}

function teamInclude() {
  return {
    organization: { select: { id: true, name: true, slug: true } },
    members: {
      include: {
        user: { select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }] as Prisma.TeamMemberOrderByWithRelationInput[],
    },
  } as any;
}

function teamListInclude() {
  return {
    organization: { select: { id: true, name: true, slug: true } },
    members: { select: { id: true } },
  } as any;
}

export async function listTeams(userId: string, query: TeamListQuery) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(query, {
    defaultSortBy: "createdAt",
    allowedSortBy: ["name", "createdAt", "updatedAt"],
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
          name: { contains: search, mode: "insensitive" as const },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.team.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: teamListInclude(),
    }),
    prisma.team.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function createTeam(
  userId: string,
  input: { organizationId: string; name: string; memberIds?: string[] },
) {
  await assertOrganizationAccess(userId, input.organizationId, ["OWNER", "ADMIN"]);

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
      },
    });

    await syncTeamMembers(team.id, input.organizationId, [userId], input.memberIds ?? [], tx);
    await ensureTeamHasOwner(team.id, tx);

    return tx.team.findUnique({
      where: { id: team.id },
      include: teamInclude(),
    });
  });
}

export async function getTeamById(userId: string, teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: teamInclude(),
  });

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  await assertOrganizationAccess(userId, team.organizationId);

  return team;
}

export async function updateTeam(
  userId: string,
  teamId: string,
  input: { name?: string; memberIds?: string[] },
) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: { role: "OWNER" },
        select: { userId: true },
      },
    },
  });

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  await assertOrganizationAccess(userId, team.organizationId, ["OWNER", "ADMIN"]);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.team.update({
      where: { id: teamId },
      data: {
        name: input.name ?? team.name,
      },
    });

    const ownerUserIds = team.members.map((member) => member.userId);
    await syncTeamMembers(teamId, team.organizationId, ownerUserIds, input.memberIds, tx);
    await ensureTeamHasOwner(teamId, tx);

    return tx.team.findUnique({
      where: { id: updated.id },
      include: teamInclude(),
    });
  });
}

export async function deleteTeam(userId: string, teamId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  await assertOrganizationAccess(userId, team.organizationId, ["OWNER", "ADMIN"]);

  return prisma.$transaction(async (tx) => {
    await tx.user.updateMany({ where: { teamId }, data: { teamId: null } });
    return tx.team.delete({ where: { id: teamId } });
  });
}
