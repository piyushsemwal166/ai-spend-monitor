import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";

export default function OrganizationSettingsPage() {
  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Organizations"
        title="Organization settings"
        description="Configure workspace defaults, governance policies, and billing notes."
      />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormInput label="Organization name" name="name" placeholder="Northstar AI" />
            <FormInput label="Billing contact" name="billing" placeholder="billing@company.com" />
            <FormSelect
              label="Default currency"
              name="currency"
              options={[
                { label: "USD", value: "usd" },
                { label: "EUR", value: "eur" },
                { label: "GBP", value: "gbp" },
              ]}
            />
            <FormSelect
              label="Alert threshold"
              name="threshold"
              options={[
                { label: "80%", value: "80" },
                { label: "90%", value: "90" },
                { label: "95%", value: "95" },
              ]}
            />
          </div>
          <FormTextarea label="Notes" name="notes" placeholder="Add billing and governance notes for the organization." />
          <div className="flex flex-wrap gap-3">
            <Button type="button">Save settings</Button>
            <button className={buttonClassName({ variant: "outline" })}>Cancel</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}