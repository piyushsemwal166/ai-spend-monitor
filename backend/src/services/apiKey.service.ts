import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { assertOrganizationAccess, getAccessibleOrganizationIds } from "@/services/organization.service";
import { decryptSecret, encryptSecret } from "@/utils/crypto";

type ApiKeyProvider = "GEMINI" | "OPENAI" | "ANTHROPIC" | "GOOGLE" | "AZURE";

const apiKeySelect = {
  id: true,
  organizationId: true,
  provider: true,
  createdAt: true,
  updatedAt: true,
  organization: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

export async function listApiKeys(userId: string, organizationId?: string) {
  if (organizationId) {
    await assertOrganizationAccess(userId, organizationId);
    return prisma.apiKey.findMany({
      where: { organizationId },
      select: apiKeySelect,
      orderBy: { createdAt: "desc" },
    });
  }

  const organizationIds = await getAccessibleOrganizationIds(userId);

  if (organizationIds.length === 0) {
    return [];
  }

  return prisma.apiKey.findMany({
    where: { organizationId: { in: organizationIds } },
    select: apiKeySelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getApiKeyById(userId: string, apiKeyId: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: apiKeyId },
    select: apiKeySelect,
  });

  if (!apiKey) {
    throw new AppError("API key not found", 404);
  }

  await assertOrganizationAccess(userId, apiKey.organizationId);

  return apiKey;
}

export async function createApiKey(userId: string, input: { organizationId: string; provider: ApiKeyProvider; key: string }) {
  await assertOrganizationAccess(userId, input.organizationId, ["OWNER", "ADMIN"]);

  const existing = await prisma.apiKey.findUnique({
    where: {
      organizationId_provider: {
        organizationId: input.organizationId,
        provider: input.provider,
      },
    },
  });

  if (existing) {
    throw new AppError("An API key already exists for this organization and provider", 409);
  }

  return prisma.apiKey.create({
    data: {
      organizationId: input.organizationId,
      provider: input.provider,
      encryptedKey: encryptSecret(input.key),
    },
    select: apiKeySelect,
  });
}

export async function updateApiKey(userId: string, apiKeyId: string, input: { key: string }) {
  const apiKey = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });

  if (!apiKey) {
    throw new AppError("API key not found", 404);
  }

  await assertOrganizationAccess(userId, apiKey.organizationId, ["OWNER", "ADMIN"]);

  return prisma.apiKey.update({
    where: { id: apiKeyId },
    data: { encryptedKey: encryptSecret(input.key) },
    select: apiKeySelect,
  });
}

export async function deleteApiKey(userId: string, apiKeyId: string) {
  const apiKey = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });

  if (!apiKey) {
    throw new AppError("API key not found", 404);
  }

  await assertOrganizationAccess(userId, apiKey.organizationId, ["OWNER", "ADMIN"]);

  return prisma.apiKey.delete({
    where: { id: apiKeyId },
    select: apiKeySelect,
  });
}

export async function getDecryptedApiKeyForOrganization(organizationId: string, provider: ApiKeyProvider) {
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      organizationId_provider: {
        organizationId,
        provider,
      },
    },
  });

  if (!apiKey) {
    throw new AppError(`${provider} API key not configured for this organization`, 404);
  }

  return decryptSecret(apiKey.encryptedKey);
}