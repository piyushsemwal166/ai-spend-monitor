import { BarChart3, FolderKanban, Home, Layers3, Settings, Wallet, FileText, Users2 } from "lucide-react";
import { Workflow } from "lucide-react";

export const marketingLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Pricing", href: "/#pricing" },
];

export const dashboardNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "AI Playground", href: "/ai-playground", icon: BarChart3 },
  { label: "Gateway", href: "/gateway", icon: Workflow },
  { label: "Organizations", href: "/organizations", icon: Layers3 },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Teams", href: "/teams", icon: Users2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Usage Logs", href: "/usage-logs", icon: FileText },
  { label: "Budgets", href: "/budgets", icon: Wallet },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const quickLinks = [
  { label: "Usage Insights", href: "/dashboard", icon: BarChart3 },
  { label: "AI Playground", href: "/ai-playground", icon: Layers3 },
  { label: "Project Control", href: "/projects", icon: FolderKanban },
  { label: "Budget Guardrails", href: "/budgets", icon: Wallet },
];