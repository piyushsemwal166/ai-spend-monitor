import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Spend OS",
  description: "Privacy Policy for AI Spend OS.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-xl shadow-slate-900/10 dark:bg-slate-950/55 sm:p-10">
        <header className="mb-8 space-y-3 border-b border-white/10 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">AI Spend OS</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: June 4, 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">1. Scope</h2>
            <p>
              This Privacy Policy explains how AI Spend OS collects, uses, stores, and shares personal information when you use our website,
              applications, APIs, and related services (the "Services"). This policy applies to account owners, team members, and visitors who
              interact with AI Spend OS.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">2. Information We Collect</h2>
            <p>We collect information necessary to operate and secure the Services, including:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Account information such as name, email address, organization, and login credentials.</li>
              <li>Workspace information such as project names, budget settings, team assignments, and governance preferences.</li>
              <li>Usage telemetry including request metadata, model/provider selection, token counts, timestamps, and cost metrics.</li>
              <li>Billing and transaction records, including subscription status, invoices, payment references, and tax details.</li>
              <li>Technical and security data such as IP address, browser/device data, session logs, and audit events.</li>
              <li>Support communications and feedback submitted through email or product channels.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">3. How We Use Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provide, maintain, and improve the Services and user experience.</li>
              <li>Authenticate users, enforce access controls, and prevent unauthorized activity.</li>
              <li>Generate analytics, reports, budget alerts, and spend insights requested by your organization.</li>
              <li>Process subscriptions, issue invoices, maintain tax records, and support financial operations.</li>
              <li>Respond to support requests, product feedback, and operational incidents.</li>
              <li>Comply with legal obligations and enforce our contractual terms.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">4. Legal Bases for Processing</h2>
            <p>
              We process data under applicable legal bases, including performance of a contract, legitimate interests in operating and securing the
              Services, legal compliance, and consent where required by law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">5. Data Sharing</h2>
            <p>We do not sell personal data. We may share information with:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Service providers that support hosting, security, monitoring, communications, and billing.</li>
              <li>Payment processors for transaction handling and invoice settlement.</li>
              <li>Professional advisors and authorities where required by law or to protect rights and safety.</li>
              <li>Successor entities in a merger, acquisition, or asset transfer subject to confidentiality safeguards.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">6. Data Retention</h2>
            <p>
              We retain personal and operational data for as long as necessary to provide the Services, satisfy legal and accounting obligations,
              resolve disputes, and enforce agreements. Retention periods vary by data category and regulatory requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">7. Security</h2>
            <p>
              We apply technical and organizational controls designed to protect data, including encryption, access restrictions, audit logging,
              and ongoing security monitoring. No system is perfectly secure, and users should also protect account credentials and access tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">8. International Transfers</h2>
            <p>
              Your information may be processed in countries where we or our providers operate. When required, we implement appropriate safeguards
              for cross-border transfers in accordance with applicable law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">9. Your Rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, delete, restrict, or object to processing of your data, and to
              request data portability. You may also have rights related to marketing preferences and consent withdrawal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">10. Children&apos;s Privacy</h2>
            <p>
              The Services are not directed to children. We do not knowingly collect personal information from individuals who are below the age
              threshold defined by applicable law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">11. Policy Updates</h2>
            <p>
              We may update this Privacy Policy to reflect legal, operational, or product changes. Material updates will be posted with a revised
              "Last updated" date.
            </p>
          </section>

          <section className="rounded-2xl border border-cyan-300/20 bg-cyan-500/5 p-4">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">12. Contact</h2>
            <p>
              For privacy-related requests or questions, contact us at{" "}
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
