import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

export default function BillingSuccessPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Payment successful" description="Thank you — your subscription is active." />
      <p className="text-sm">You can return to the dashboard.</p>
      <Link href="/dashboard" className="text-cyan-600">Go to dashboard</Link>
    </div>
  );
}
