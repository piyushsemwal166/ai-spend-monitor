import { Prisma } from "@prisma/client";

export interface ModelPricingLike {
  inputPricePerMillion: Prisma.Decimal | number | string;
  outputPricePerMillion: Prisma.Decimal | number | string;
}

export function calculateCost(inputTokens: number, outputTokens: number, modelPricing: ModelPricingLike): Prisma.Decimal {
  const inputPrice = new Prisma.Decimal(modelPricing.inputPricePerMillion);
  const outputPrice = new Prisma.Decimal(modelPricing.outputPricePerMillion);

  return new Prisma.Decimal(inputTokens)
    .mul(inputPrice)
    .div(1_000_000)
    .plus(new Prisma.Decimal(outputTokens).mul(outputPrice).div(1_000_000));
}