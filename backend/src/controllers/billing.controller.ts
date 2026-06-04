import type { Request, Response } from "express";
import { prisma } from "@/config/prisma";

export async function getInvoices(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const membership = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
  if (!membership) {
    res.status(200).json({ data: [] });
    return;
  }

  const subscriptions = await prisma.subscription.findMany({ where: { organizationId: membership.organizationId } });
  const subscriptionIds = subscriptions.map((s) => s.id);

  const invoices = await prisma.invoice.findMany({ where: { subscriptionId: { in: subscriptionIds } }, orderBy: { issuedAt: "desc" } });

  res.status(200).json({ data: invoices });
}
