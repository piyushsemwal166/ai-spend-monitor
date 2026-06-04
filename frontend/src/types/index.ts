export type TrendDirection = "up" | "down" | "flat";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  plan: string;
  status: "active" | "trial" | "paused";
  spend: number;
  budget: number;
  members: number;
  projects: number;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  organization: string;
  provider: string;
  budget: number;
  spend: number;
  status: "healthy" | "watching" | "over";
  usage: number;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  owner: string;
  limit: number;
  spent: number;
  cadence: string;
  status: "on-track" | "warning" | "breached";
}

export interface UsageLog {
  id: string;
  project: string;
  provider: string;
  tokens: number;
  cost: number;
  date: string;
}

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: TrendDirection;
  icon: string;
}

export interface Testimonial {
  name: string;
  title: string;
  company: string;
  quote: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface MarketingFeature {
  title: string;
  description: string;
}