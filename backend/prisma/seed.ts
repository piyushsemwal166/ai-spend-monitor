import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = "owner@aispendos.dev";
  const slug = "ai-spend-os-demo";

  await prisma.organization.deleteMany({
    where: { slug },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Demo Owner",
      password: await hashPassword("Password123!"),
      role: "OWNER",
    },
    create: {
      name: "Demo Owner",
      email,
      password: await hashPassword("Password123!"),
      role: "OWNER",
    },
  });

  const organization = await prisma.organization.create({
    data: {
      name: "AI Spend OS Demo",
      slug,
      description: "Seeded organization for dashboard and API testing.",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Core Platform",
        description: "Primary inference workload.",
        organizationId: organization.id,
        status: "ACTIVE",
      },
    }),
    prisma.project.create({
      data: {
        name: "Research Sandbox",
        description: "Exploratory model experiments.",
        organizationId: organization.id,
        status: "PAUSED",
      },
    }),
  ]);

  for (const project of projects) {
    const usageLogs = [
      {
        projectId: project.id,
        model: "gpt-4.1",
        inputTokens: 8000,
        outputTokens: 4000,
        totalTokens: 12000,
        provider: "OPENAI" as const,
        tokens: 12000,
        cost: 84.5,
        estimatedCost: 84.5,
        requestCount: 96,
      },
      {
        projectId: project.id,
        model: "claude-3-5-sonnet",
        inputTokens: 6000,
        outputTokens: 3000,
        totalTokens: 9000,
        provider: "ANTHROPIC" as const,
        tokens: 9000,
        cost: 61.25,
        estimatedCost: 61.25,
        requestCount: 54,
      },
    ];

    await Promise.all(
      usageLogs.map((entry) =>
        prisma.usageLog.create({
          data: entry,
        }),
      ),
    );

    const currentSpend = usageLogs.reduce((total, entry) => total + entry.cost, 0);

    await prisma.budget.create({
      data: {
        projectId: project.id,
        monthlyBudget: 500,
        currentSpend,
        remainingBudget: 500 - currentSpend,
        alertThreshold: 80,
      },
    });
  }

  await Promise.all([
    prisma.modelPricing.upsert({
      where: { provider_model: { provider: "GEMINI", model: "gemini-2.5-flash" } },
      update: { inputPricePerMillion: 0.35, outputPricePerMillion: 1.05 },
      create: {
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        inputPricePerMillion: 0.35,
        outputPricePerMillion: 1.05,
      },
    }),
    prisma.modelPricing.upsert({
      where: { provider_model: { provider: "GEMINI", model: "gemini-2.5-pro" } },
      update: { inputPricePerMillion: 1.25, outputPricePerMillion: 10 },
      create: {
        provider: "GEMINI",
        model: "gemini-2.5-pro",
        inputPricePerMillion: 1.25,
        outputPricePerMillion: 10,
      },
    }),
    prisma.modelPricing.upsert({
      where: { provider_model: { provider: "OPENAI", model: "gpt-4o" } },
      update: { inputPricePerMillion: 0, outputPricePerMillion: 0 },
      create: {
        provider: "OPENAI",
        model: "gpt-4o",
        inputPricePerMillion: 0,
        outputPricePerMillion: 0,
      },
    }),
    prisma.modelPricing.upsert({
      where: { provider_model: { provider: "OPENAI", model: "gpt-4o-mini" } },
      update: { inputPricePerMillion: 0, outputPricePerMillion: 0 },
      create: {
        provider: "OPENAI",
        model: "gpt-4o-mini",
        inputPricePerMillion: 0,
        outputPricePerMillion: 0,
      },
    }),
    prisma.modelPricing.upsert({
      where: { provider_model: { provider: "OPENAI", model: "gpt-4.1" } },
      update: { inputPricePerMillion: 0, outputPricePerMillion: 0 },
      create: {
        provider: "OPENAI",
        model: "gpt-4.1",
        inputPricePerMillion: 0,
        outputPricePerMillion: 0,
      },
    }),
    prisma.modelPricing.upsert({
      where: { provider_model: { provider: "OPENAI", model: "gpt-4.1-mini" } },
      update: { inputPricePerMillion: 0, outputPricePerMillion: 0 },
      create: {
        provider: "OPENAI",
        model: "gpt-4.1-mini",
        inputPricePerMillion: 0,
        outputPricePerMillion: 0,
      },
    }),
  ]);

  // Seed subscription plans
  await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { slug: "free" },
      update: {
        name: "Free",
        priceCents: 0,
        projectsLimit: 3,
        teamsLimit: 3,
        requestsLimit: 1000,
        providers: "GEMINI",
        description: "Free tier — Gemini access only",
      },
      create: {
        slug: "free",
        name: "Free",
        priceCents: 0,
        projectsLimit: 3,
        teamsLimit: 3,
        requestsLimit: 1000,
        providers: "GEMINI",
        description: "Free tier — Gemini access only",
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: "pro" },
      update: {
        name: "Pro",
        priceCents: 99900,
        projectsLimit: null,
        teamsLimit: null,
        requestsLimit: null,
        providers: "GEMINI,OPENAI,ANTHROPIC,GOOGLE,AZURE",
        description: "Pro — multi-provider access",
      },
      create: {
        slug: "pro",
        name: "Pro",
        priceCents: 99900,
        projectsLimit: null,
        teamsLimit: null,
        requestsLimit: null,
        providers: "GEMINI,OPENAI,ANTHROPIC,GOOGLE,AZURE",
        description: "Pro — multi-provider access",
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: "enterprise" },
      update: {
        name: "Enterprise",
        priceCents: 0,
        projectsLimit: null,
        teamsLimit: null,
        requestsLimit: null,
        providers: null,
        description: "Enterprise — contact sales",
      },
      create: {
        slug: "enterprise",
        name: "Enterprise",
        priceCents: 0,
        projectsLimit: null,
        teamsLimit: null,
        requestsLimit: null,
        providers: null,
        description: "Enterprise — contact sales",
      },
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });