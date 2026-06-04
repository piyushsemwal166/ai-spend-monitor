import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | AI Spend OS",
  description: "Terms and Conditions for AI Spend OS.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-xl shadow-slate-900/10 dark:bg-slate-950/55 sm:p-10">
        <header className="mb-8 space-y-3 border-b border-white/10 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">AI Spend OS</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Terms &amp; Conditions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: June 4, 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">1. Agreement</h2>
            <p>
              These Terms &amp; Conditions ("Terms") govern your access to and use of AI Spend OS websites, software, APIs, dashboards, and related
              services (collectively, the "Services"). By using the Services, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">2. Eligibility and Accounts</h2>
            <p>
              You must be authorized to bind your organization and comply with applicable laws to use the Services. You are responsible for account
              credentials, access management, and all activity occurring under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">3. Service Use and Acceptable Conduct</h2>
            <p>You agree not to misuse the Services. Prohibited conduct includes:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Attempting unauthorized access to systems, data, or other customer workspaces.</li>
              <li>Interfering with security features, rate limits, or operational integrity of the platform.</li>
              <li>Using the Services for unlawful, fraudulent, or rights-infringing activities.</li>
              <li>Submitting malicious code or abusing integrations in ways that degrade service reliability.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">4. Subscription and Billing</h2>
            <p>
              Paid plans are billed according to your selected subscription terms. Fees, taxes, renewal cycles, and billing details are shown in your
              workspace billing settings and invoices. Non-payment may result in suspension or limited access to paid features.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">5. Customer Data and Responsibilities</h2>
            <p>
              You retain ownership of your Customer Data. You are responsible for obtaining all rights and consents necessary to upload, process,
              and analyze such data through the Services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">6. Intellectual Property</h2>
            <p>
              AI Spend OS and related materials are protected by intellectual property laws. We grant a limited, non-exclusive, non-transferable
              right to use the Services during your subscription term, subject to these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">7. Confidentiality</h2>
            <p>
              Each party agrees to protect confidential information of the other party and use it only for authorized purposes under these Terms,
              except where disclosure is required by law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">8. Warranties and Disclaimers</h2>
            <p>
              The Services are provided on an "as is" and "as available" basis. To the extent permitted by law, AI Spend OS disclaims implied
              warranties including merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, AI Spend OS is not liable for indirect, incidental, consequential, special, or punitive
              damages, or loss of profits, revenue, or data. Aggregate liability is limited to amounts paid by you for the Services in the
              12 months preceding the claim.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">10. Suspension and Termination</h2>
            <p>
              We may suspend or terminate access for material breaches, legal requirements, security risks, or prolonged non-payment. Upon
              termination, rights to use the Services cease, subject to applicable data export and retention obligations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">11. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by applicable laws in the contracting jurisdiction specified in your order form or subscription agreement.
              Parties will attempt good-faith resolution before initiating formal proceedings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">12. Updates to Terms</h2>
            <p>
              We may update these Terms from time to time. If material changes are made, we will provide notice through the Services and update the
              effective date above.
            </p>
          </section>

          <section className="rounded-2xl border border-cyan-300/20 bg-cyan-500/5 p-4">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">13. Contact</h2>
            <p>
              Questions about these Terms can be sent to{" "}
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
