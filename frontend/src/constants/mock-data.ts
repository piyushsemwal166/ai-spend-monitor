import type {
  Budget,
  MarketingFeature,
  Organization,
  PricingPlan,
  Project,
  Testimonial,
  UsageLog,
} from "@/types";

export const marketingFeatures: MarketingFeature[] = [
  {
    title: "Spend Tracking",
    description: "Monitor every token, request, and model cost across the business in real time.",
  },
  {
    title: "Budget Management",
    description: "Set guardrails at the org, team, or project level before costs drift.",
  },
  {
    title: "Organization Management",
    description: "Keep teams, permissions, and billing aligned in one control plane.",
  },
  {
    title: "Project Analytics",
    description: "See which initiatives are creating value and which are consuming budget.",
  },
  {
    title: "Usage Monitoring",
    description: "Track request volume, token consumption, and provider mix by project.",
  },
  {
    title: "Real-Time Insights",
    description: "Get instant visibility into spikes, anomalies, and optimization opportunities.",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Beta User",
    title: "Product Lead",
    company: "Early Access Program",
    quote:
      "AI Spend OS gave our team better visibility into model usage and spend from day one.",
  },
  {
    name: "Beta User",
    title: "Engineering Manager",
    company: "Early Access Program",
    quote:
      "The dashboard is clear and fast, and helped us spot budget issues before they became blockers.",
  },
  {
    name: "Beta User",
    title: "FinOps Analyst",
    company: "Early Access Program",
    quote:
      "We moved from manual tracking to a live operating view of AI costs with minimal setup time.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "₹0/month",
    description: "For individuals and small teams getting started with AI spend control.",
    features: ["3 Projects", "3 Teams", "1000 Requests/month", "Gemini Support", "Basic Analytics"],
  },
  {
    name: "Pro",
    price: "₹999/month",
    description: "For growing teams that need multi-provider visibility and stronger controls.",
    features: ["Unlimited Projects", "Unlimited Teams", "Gemini + OpenAI + Claude + Groq", "Advanced Analytics", "Budget Alerts", "Gateway Logs"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Contact Sales",
    description: "For enterprises with compliance, governance, and custom deployment needs.",
    features: ["SSO/SAML", "Audit Logs", "RBAC", "Custom Limits", "Priority Support"],
  },
];

export const organizations: Organization[] = [
  {
    id: "org-1",
    name: "Northstar AI",
    industry: "Finance",
    plan: "Pro",
    status: "active",
    spend: 28400,
    budget: 35000,
    members: 48,
    projects: 12,
    updatedAt: "2026-05-29T09:24:00Z",
  },
  {
    id: "org-2",
    name: "Cinder Health",
    industry: "Healthcare",
    plan: "Enterprise",
    status: "active",
    spend: 19800,
    budget: 24000,
    members: 34,
    projects: 8,
    updatedAt: "2026-05-28T12:18:00Z",
  },
  {
    id: "org-3",
    name: "Atlas Commerce",
    industry: "Retail",
    plan: "Free",
    status: "trial",
    spend: 6400,
    budget: 12000,
    members: 19,
    projects: 5,
    updatedAt: "2026-05-27T16:00:00Z",
  },
];

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Customer Support Copilot",
    organization: "Northstar AI",
    provider: "OpenAI",
    budget: 12000,
    spend: 8420,
    status: "healthy",
    usage: 67,
    updatedAt: "2026-05-29T09:24:00Z",
  },
  {
    id: "proj-2",
    name: "Clinical Summaries",
    organization: "Cinder Health",
    provider: "Anthropic",
    budget: 9000,
    spend: 8600,
    status: "watching",
    usage: 92,
    updatedAt: "2026-05-29T13:10:00Z",
  },
  {
    id: "proj-3",
    name: "Search Intelligence",
    organization: "Atlas Commerce",
    provider: "OpenAI",
    budget: 6500,
    spend: 7100,
    status: "over",
    usage: 109,
    updatedAt: "2026-05-28T10:05:00Z",
  },
];

export const budgets: Budget[] = [
  {
    id: "budget-1",
    name: "Northstar Core",
    owner: "Platform",
    limit: 30000,
    spent: 22800,
    cadence: "Monthly",
    status: "on-track",
  },
  {
    id: "budget-2",
    name: "Cinder Clinical AI",
    owner: "Operations",
    limit: 20000,
    spent: 18940,
    cadence: "Monthly",
    status: "warning",
  },
  {
    id: "budget-3",
    name: "Atlas Growth",
    owner: "Marketing",
    limit: 12000,
    spent: 12410,
    cadence: "Monthly",
    status: "breached",
  },
];

export const usageLogs: UsageLog[] = [
  {
    id: "log-1",
    project: "Customer Support Copilot",
    provider: "OpenAI",
    tokens: 842300,
    cost: 1240,
    date: "2026-05-29T09:24:00Z",
  },
  {
    id: "log-2",
    project: "Clinical Summaries",
    provider: "Anthropic",
    tokens: 621800,
    cost: 980,
    date: "2026-05-29T13:10:00Z",
  },
  {
    id: "log-3",
    project: "Search Intelligence",
    provider: "OpenAI",
    tokens: 935200,
    cost: 1580,
    date: "2026-05-28T10:05:00Z",
  },
];

export const dailySpendData = [
  { day: "Mon", value: 4200 },
  { day: "Tue", value: 4700 },
  { day: "Wed", value: 3900 },
  { day: "Thu", value: 5100 },
  { day: "Fri", value: 6200 },
  { day: "Sat", value: 5800 },
  { day: "Sun", value: 6400 },
];

export const monthlySpendData = [
  { month: "Jan", value: 18000 },
  { month: "Feb", value: 21000 },
  { month: "Mar", value: 19500 },
  { month: "Apr", value: 24800 },
  { month: "May", value: 28400 },
  { month: "Jun", value: 31200 },
];

export const budgetUtilizationData = [
  { name: "Utilized", value: 78 },
  { name: "Remaining", value: 22 },
];

export const recentProjects = projects;
export const recentUsageLogs = usageLogs;