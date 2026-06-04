import type { Request, Response } from "express";
import { prisma } from "@/config/prisma";

export async function getPlans(_req: Request, res: Response): Promise<void> {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { priceCents: "asc" } });
  res.status(200).json({ data: plans });
}

export async function getCurrentSubscription(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const membership = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
  if (!membership) {
    res.status(200).json({ data: null });
    return;
  }

  const subscription = await prisma.subscription.findFirst({ where: { organizationId: membership.organizationId }, include: { plan: true } });
  if (!subscription) {
    // Return default free plan info when no subscription exists
    const free = await prisma.subscriptionPlan.findUnique({ where: { slug: "free" } });
    res.status(200).json({ data: { plan: free ?? null, subscription: null } });
    return;
  }

  res.status(200).json({ data: { plan: subscription.plan, subscription } });
}
