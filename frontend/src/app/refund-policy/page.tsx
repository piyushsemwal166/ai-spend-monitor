import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | AI Spend OS",
  description: "Refund Policy for AI Spend OS.",
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-xl shadow-slate-900/10 dark:bg-slate-950/55 sm:p-10">
        <header className="mb-8 space-y-3 border-b border-white/10 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">AI Spend OS</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Refund Policy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: June 4, 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">1. Overview</h2>
            <p>
              This Refund Policy explains when fees paid for AI Spend OS subscriptions may be eligible for refund. It applies to direct purchases
              made through our website and billing platform unless otherwise agreed in a signed enterprise contract.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">2. Free and Trial Access</h2>
            <p>
              No charges apply to free plans. If a trial is offered, trial access is provided without charge unless otherwise stated. Charges begin
              only after conversion to a paid plan.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">3. Monthly and Annual Subscriptions</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Monthly plans are generally non-refundable once a billing cycle begins.</li>
              <li>Annual plans may be eligible for a pro-rated refund only where required by law or approved in writing by AI Spend OS.</li>
              <li>Cancellation prevents future renewals but does not automatically create a refund for the current paid period.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">4. Duplicate or Incorrect Charges</h2>
            <p>
              If you were charged more than once for the same invoice or billed incorrectly due to a processing error, we will investigate and issue
              an appropriate correction or refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">5. Service Availability and Credits</h2>
            <p>
              In the event of verified service outages or material service failures attributable to AI Spend OS, we may issue service credits or
              partial refunds at our discretion, subject to your contract terms and impact assessment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">6. Non-Refundable Items</h2>
            <p>The following are typically non-refundable:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Used subscription periods and consumed platform services.</li>
              <li>Taxes, regulatory fees, and government charges remitted to authorities.</li>
              <li>Professional services, onboarding packages, or custom implementation fees unless explicitly stated otherwise.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">7. Request Process</h2>
            <p>To request a refund, include your account email, invoice ID, and reason for request. We generally review requests within 7 business days.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">8. Payment Processor Timelines</h2>
            <p>
              Approved refunds are processed through the original payment method. Settlement timelines depend on banks, card networks, and payment
              processors, and may vary by region.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">9. Policy Updates</h2>
            <p>
              We may update this policy periodically to reflect operational, contractual, or legal changes. The latest version is published with the
              updated effective date.
            </p>
          </section>

          <section className="rounded-2xl border border-cyan-300/20 bg-cyan-500/5 p-4">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">10. Contact</h2>
            <p>
              For refund-related support, contact{" "}
              <a className="font-medium text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-300" href="mailto:piyushdattsemwal@gmail.com">
                piyushdattsemwal@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
