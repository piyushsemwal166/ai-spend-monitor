import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { pricingPlans, testimonials, marketingFeatures } from "@/constants/mock-data";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  "Create Organization",
  "Add Projects",
  "Set Budgets",
  "Monitor Usage",
  "Optimize Spending",
];

const benefits = [
  { title: "Cost Visibility", description: "See spend by org, project, and provider in one place." },
  { title: "Team Collaboration", description: "Give every team member the context they need to act fast." },
  { title: "Budget Control", description: "Define limits and escalate before overages happen." },
  { title: "AI Spend Governance", description: "Build the controls you need for responsible AI use." },
];

export default function MarketingPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">
            <Sparkles className="h-4 w-4" />
            Enterprise AI spend governance
          </div>
          <div className="space-y-5">
            <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Control AI costs across your entire organization.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8 dark:text-slate-400">
              Track usage, budgets, spend, projects, and team activity from one centralized platform built for modern SaaS teams.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/dashboard" className={buttonClassName({ variant: "primary", size: "lg" })}>
              Explore Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/register" className={buttonClassName({ variant: "secondary", size: "lg" })}>
              Sign Up
            </Link>
            <Link href="/login" className={buttonClassName({ variant: "outline", size: "lg" })}>
              Login
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { label: "Budget coverage", value: "92%" },
              { label: "Projects monitored", value: "128" },
              { label: "Anomalies flagged", value: "14" },
            ].map((metric) => (
              <Card key={metric.label} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-transparent blur-3xl" />
          <Card className="relative overflow-hidden border-white/20 bg-slate-950/92 text-white shadow-2xl shadow-slate-950/20">
            <CardHeader className="border-b border-white/10 pb-5 sm:pb-6">
              <CardTitle className="text-white">AI Spend Command Center</CardTitle>
              <CardDescription className="text-slate-300">
                High-velocity visibility for teams running AI at scale.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-300">Today&apos;s spend</p>
                    <BarChart3 className="h-4 w-4 text-cyan-300" />
                  </div>
                  <p className="mt-3 font-display text-3xl font-semibold sm:text-4xl">$12.4k</p>
                  <p className="mt-2 text-sm text-emerald-300">+14.2% vs yesterday</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-300">Remaining budget</p>
                    <Wallet className="h-4 w-4 text-cyan-300" />
                  </div>
                  <p className="mt-3 font-display text-3xl font-semibold sm:text-4xl">$42.8k</p>
                  <p className="mt-2 text-sm text-slate-300">Across 3 active portfolios</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-4 ring-1 ring-white/10 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Cost spikes detected</span>
                    <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  </div>
                  <p className="mt-3 text-xl font-semibold sm:text-2xl">2 projects need review</p>
                  <p className="mt-2 text-sm text-slate-300">Alerts were triggered before the budget threshold was breached.</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-cyan-300" />48 members</div>
                    <div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-cyan-300" />12 projects</div>
                    <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-cyan-300" />Pro plan</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="features" className="space-y-6 sm:space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Platform features</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Built like a premium SaaS control plane.</h2>
          <p className="text-slate-500 dark:text-slate-400">Every surface is designed to communicate confidence, clarity, and operational rigor.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-5">
          {marketingFeatures.map((feature) => (
            <Card key={feature.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div className="space-y-5 sm:space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">How it works</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Simple setup, enterprise-grade control.</h2>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/70 px-4 py-4 dark:bg-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                  {index + 1}
                </div>
                <p className="font-medium text-slate-950 dark:text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 sm:gap-5">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
              <CardHeader>
                <CardTitle>{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="dashboard" className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Dashboard preview</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">A dashboard that feels like a product, not an admin panel.</h2>
          <p className="max-w-xl text-slate-500 dark:text-slate-400">Preview charts, tables, and controls are arranged to mirror the actual operating experience your teams will use every day.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-white/10 bg-white/75 p-4 sm:p-6 dark:bg-slate-950/55">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Usage monitoring</p>
              <Zap className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="mt-6 h-36 rounded-3xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 p-4 sm:h-40 sm:p-5">
              <div className="flex h-full items-end gap-3">
                {[42, 64, 36, 72, 48, 80].map((height) => (
                  <div key={height} className="flex-1 rounded-t-2xl bg-slate-950/80 dark:bg-white" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </Card>
          <Card className="border-white/10 bg-white/75 p-4 sm:p-6 dark:bg-slate-950/55">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Budgets</p>
              <ShieldCheck className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="mt-6 space-y-4">
              {[78, 52, 91].map((value) => (
                <div key={value}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Portfolio</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="testimonials" className="space-y-6 sm:space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Testimonials</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Teams use AI Spend OS to make spending legible.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 sm:gap-5">
          {testimonials.map((testimonial) => (
            <Card key={`${testimonial.name}-${testimonial.title}`} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
              <CardHeader>
                <CardTitle>{testimonial.name}</CardTitle>
                <CardDescription>
                  {testimonial.title} at {testimonial.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-600 dark:text-slate-300">“{testimonial.quote}”</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="space-y-6 sm:space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Pricing preview</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Future-ready pricing for teams of every size.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 sm:gap-5">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "relative border-cyan-300/70 bg-slate-950 text-white shadow-2xl shadow-cyan-500/25 ring-1 ring-cyan-300/40 lg:-mt-2"
                  : "border-white/10 bg-white/75 shadow-sm shadow-slate-900/10 dark:bg-slate-950/55"
              }
            >
              <CardHeader className="space-y-3 pb-4">
                {plan.highlighted ? (
                  <div className="mb-2 inline-flex w-fit rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    Recommended
                  </div>
                ) : null}
                <CardTitle className={plan.highlighted ? "text-white" : undefined}>{plan.name}</CardTitle>
                <CardDescription className={plan.highlighted ? "text-slate-300" : undefined}>{plan.description}</CardDescription>
                <div className={plan.highlighted ? "font-display text-4xl font-semibold text-white" : "font-display text-4xl font-semibold text-slate-950 dark:text-white"}>{plan.price}</div>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                {plan.features.map((feature) => (
                  <div key={feature} className={plan.highlighted ? "flex items-center gap-2 text-sm text-slate-200" : "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"}>
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    {feature}
                  </div>
                ))}
                <div className="pt-4">
                  <Link
                    href={plan.name === "Enterprise" ? "mailto:sales@aispendos.dev" : "/register"}
                    className={
                      plan.highlighted
                        ? "inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        : "inline-flex w-full items-center justify-center rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    }
                  >
                    {plan.name === "Free" ? "Start Free" : plan.name === "Pro" ? "Upgrade to Pro" : "Talk to Sales"}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-800 dark:text-cyan-200">
          Payments securely processed via Cashfree. GST invoices available for paid plans.
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950 px-4 py-10 text-white shadow-2xl shadow-slate-950/20 sm:px-6 sm:py-12 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Start now</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Start managing AI spend today.</h2>
            <p className="text-slate-300">Bring clarity to budgets, usage, and team behavior before costs spiral.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/register" className={buttonClassName({ variant: "secondary", size: "lg" })}>
              Get Started
            </Link>
            <Link href="/login" className={buttonClassName({ variant: "outline", size: "lg" })}>
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}