import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Pricing" description="Choose a plan that fits your team." />

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">₹0 — 3 Projects, 3 Teams, 1000 Requests — Gemini only</p>
            <Link href="/billing" className="text-sm font-medium text-cyan-600">Upgrade</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">₹999 — Unlimited Projects and Teams, Multi Provider</p>
            <Link href="/billing" className="text-sm font-medium text-cyan-600">Upgrade</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Contact Sales for custom pricing</p>
            <Link href="/contact" className="text-sm font-medium text-cyan-600">Contact</Link>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-medium">Feature comparison</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <div>Free: Gemini only, limited projects and teams</div>
          <div>Pro: All providers, advanced analytics</div>
          <div>Enterprise: Custom integrations and SLAs</div>
        </div>
      </section>
    </div>
  );
}
