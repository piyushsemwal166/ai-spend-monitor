import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

export default function BillingCancelPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Payment cancelled" description="No changes were made to your subscription." />
      <p className="text-sm">If you believe this is an error, please try again later.</p>
      <Link href="/settings/billing" className="text-cyan-600">Back to billing</Link>
    </div>
  );
}
