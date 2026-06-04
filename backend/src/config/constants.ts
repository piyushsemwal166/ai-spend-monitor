export const APP_NAME = "AI Spend OS";
export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const USER_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PROJECT_STATUSES = ["ACTIVE", "PAUSED", "ARCHIVED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROVIDERS = ["GEMINI", "OPENAI", "ANTHROPIC", "GOOGLE", "AZURE"] as const;
export type Provider = (typeof PROVIDERS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];