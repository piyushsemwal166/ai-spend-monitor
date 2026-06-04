import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { Provider } from "@prisma/client";

export async function getModelPricing(provider: Provider, model: string) {
  const pricing = await prisma.modelPricing.findUnique({
    where: {
      provider_model: {
        provider,
        model,
      },
    },
  });

  if (!pricing) {
    throw new AppError(`Pricing not found for ${provider} ${model}`, 404);
  }

  return pricing;
}

export async function listModelPricing(provider?: Provider) {
  return prisma.modelPricing.findMany({
    where: provider ? { provider } : undefined,
    orderBy: [{ provider: "asc" }, { model: "asc" }],
  });
}