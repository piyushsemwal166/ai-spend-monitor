import { prisma } from "@/config/prisma";
import { getAccessibleProjectIds } from "@/services/project.service";

export type BudgetAlertStatus = "NORMAL" | "WARNING" | "CRITICAL" | "EXCEEDED";

function getStatus(utilization: number): BudgetAlertStatus {
  if (utilization >= 100) return "EXCEEDED";
  if (utilization >= 90) return "CRITICAL";
  if (utilization >= 80) return "WARNING";
  return "NORMAL";
}

export async function getBudgetStatus(userId: string) {
  const projectIds = await getAccessibleProjectIds(userId);

  if (projectIds.length === 0) {
    return {
      currentSpend: 0,
      remainingBudget: 0,
      monthlyBudget: 0,
      utilizationPercentage: 0,
      status: "NORMAL" as BudgetAlertStatus,
    };
  }

  const aggregate = await prisma.budget.aggregate({
    where: { projectId: { in: projectIds } },
    _sum: { currentSpend: true, remainingBudget: true, monthlyBudget: true },
  });

  const currentSpend = Number(aggregate._sum.currentSpend ?? 0);
  const remainingBudget = Number(aggregate._sum.remainingBudget ?? 0);
  const monthlyBudget = Number(aggregate._sum.monthlyBudget ?? 0);
  const utilizationPercentage = monthlyBudget > 0 ? Math.round((currentSpend / monthlyBudget) * 100) : 0;

  return {
    currentSpend,
    remainingBudget,
    monthlyBudget,
    utilizationPercentage,
    status: getStatus(utilizationPercentage),
  };
}
