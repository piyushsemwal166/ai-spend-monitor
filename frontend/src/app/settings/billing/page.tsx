"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subscriptionService } from "@/services/subscriptionService";
import { billingService } from "@/services/billingService";

export default function SettingsBillingPage() {
  const subscriptionQuery = useQuery({ queryKey: ["subscription-current"], queryFn: subscriptionService.getCurrent });
  const invoicesQuery = useQuery({ queryKey: ["billing-invoices"], queryFn: billingService.getInvoices });

  const plan = subscriptionQuery.data?.plan;
  const subscription = subscriptionQuery.data?.subscription;

  return (
    <div className="space-y-8">
      <PageHeader title="Billing" description="Manage your subscription and view invoices." />

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2">{plan?.name ?? "Free"}</div>
          <div className="text-sm text-slate-600">Status: {subscription?.status ?? "FREE"}</div>
          <div className="text-sm text-slate-600">Renewal: {subscription?.renewedAt ? new Date(subscription.renewedAt).toLocaleDateString() : "—"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesQuery.data?.length ? (
            <ul className="space-y-2">
              {invoicesQuery.data.map((inv: any) => (
                <li key={inv.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{inv.id}</div>
                    <div className="text-sm text-slate-600">{new Date(inv.issuedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm">₹{(inv.amountCents / 100).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-600">No invoices found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
