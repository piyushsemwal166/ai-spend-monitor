import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, BellRing, Building2, Eye, Lock, ShieldCheck, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About AI Spend OS",
  description:
    "Learn about AI Spend OS, the platform for AI spend management, governance, budgeting, and analytics.",
};

const whatWeDo = [
  {
    title: "Centralized AI Spend Tracking",
    description:
      "Unify spend visibility across OpenAI, Gemini, Claude, Groq, and other providers from one operating view.",
    icon: Eye,
  },
  {
    title: "Budget Management",
    description:
      "Set budget guardrails by organization, team, and project to keep AI programs sustainable.",
    icon: Wallet,
  },
  {
    title: "Team Governance",
    description:
      "Define ownership and accountability so engineering, product, and finance teams act from shared context.",
    icon: Users,
  },
  {
    title: "Analytics and Reporting",
    description:
      "Monitor trends, anomalies, and cost drivers with actionable analytics and reporting workflows.",
    icon: BarChart3,
  },
  {
    title: "Multi-Provider Support",
    description:
      "Run governance across your full AI stack with policy and visibility that scale as your provider mix evolves.",
    icon: Building2,
  },
];

const whyAiSpendOs = [
  "Cost visibility",
  "Governance controls",
  "Budget alerts",
  "Team accountability",
  "Enterprise readiness",
];

const values = [
  {
    title: "Transparency",
    description:
      "We make spend data understandable and actionable so leaders can make confident decisions.",
    icon: Eye,
  },
  {
    title: "Security",
    description:
      "We build for secure operations with controlled access, auditability, and responsible data handling.",
    icon: Lock,
  },
  {
    title: "Reliability",
    description:
      "Teams rely on us for always-on visibility into AI usage, budgets, and system behavior.",
    icon: ShieldCheck,
  },
  {
    title: "Customer-first",
    description:
      "Our roadmap is shaped by real customer operations and the outcomes they need from AI governance.",
    icon: BellRing,
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -left-16 top-56 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              AI Spend Operating System
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                About AI Spend OS
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-300">
                AI Spend OS is an operating system for AI cost governance and visibility. We help organizations monitor,
                govern, and optimize AI spending across teams, projects, and providers.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/" className={buttonClassName({ variant: "secondary", size: "sm" })}>
                Home
              </Link>
              <Link href="/pricing" className={buttonClassName({ variant: "secondary", size: "sm" })}>
                Pricing
              </Link>
              <a href="mailto:piyushdattsemwal@gmail.com" className={buttonClassName({ variant: "outline", size: "sm" })}>
                Contact
              </a>
            </div>
          </div>

          <Card className="border-white/20 bg-slate-950/90 text-white shadow-2xl shadow-slate-950/25">
            <CardHeader>
              <CardTitle className="text-white">Our Mission</CardTitle>
              <CardDescription className="text-slate-300">
                Help organizations gain visibility and control over AI spending while preventing budget overruns and
                improving governance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">Visibility into every AI request and every rupee spent.</div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">Controls that scale from startup teams to enterprise programs.</div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">Operational confidence for finance, engineering, and product leaders.</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">What We Do</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Built for modern AI operations.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-5">
            {whatWeDo.map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <item.icon className="h-5 w-5 text-cyan-500" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
            <CardHeader>
              <CardTitle>Why AI Spend OS</CardTitle>
              <CardDescription>
                Core outcomes teams get when they operate AI programs through one governance system.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {whyAiSpendOs.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
                  <ArrowRight className="h-4 w-4 text-cyan-500" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Need help with AI governance or billing setup? We are here to support you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/70 px-4 py-3 dark:bg-white/5">
                Product: <span className="font-medium text-slate-950 dark:text-white">AI Spend OS</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/70 px-4 py-3 dark:bg-white/5">
                Support Email:{" "}
                <a href="mailto:piyushdattsemwal@gmail.com" className="font-medium text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200">
                  piyushdattsemwal@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Company Values</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">The principles behind the platform.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 sm:gap-5">
            {values.map((value) => (
              <Card key={value.title} className="border-white/10 bg-white/75 dark:bg-slate-950/55">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <value.icon className="h-4 w-4 text-cyan-500" />
                    {value.title}
                  </CardTitle>
                  <CardDescription>{value.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
