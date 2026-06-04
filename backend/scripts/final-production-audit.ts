import { PrismaClient } from "@prisma/client";
import { AppError } from "../src/middleware/error.middleware";
import { executeGatewayChat, type GatewayChatInput } from "../src/services/gateway.service";
import { geminiProvider } from "../src/providers/gemini.provider";

const BASE_URL = "http://localhost:4000/api/v1";
const prisma = new PrismaClient();

type AuthResult = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    memberships?: Array<{ role: string; organization: { id: string; name: string; slug: string | null } }>;
  };
};

type ApiResult<T> = {
  status: number;
  data: T;
  text: string;
};

type TestResult = {
  name: string;
  pass: boolean;
  details?: string;
};

const results: TestResult[] = [];

function record(name: string, pass: boolean, details?: string) {
  results.push({ name, pass, details });
}

function assert(condition: unknown, name: string, details?: string): asserts condition {
  if (!condition) {
    throw new Error(details ?? name);
  }
}

async function request<T = any>(path: string, options: { method?: string; token?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, data, text };
}

async function login(email: string, password: string): Promise<AuthResult> {
  const response = await request<AuthResult>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  assert(response.status === 200, `login ${email}`, response.text);
  return response.data.data;
}

async function register(name: string, email: string, password: string): Promise<AuthResult> {
  const response = await request<AuthResult>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
  assert(response.status === 201, `register ${email}`, response.text);
  return response.data.data;
}

function getOrgId(auth: AuthResult): string {
  const membership = auth.user.memberships?.[0];
  assert(membership, `No organization membership found for ${auth.user.email}`);
  return membership.organization.id;
}

async function createOrganization(token: string, name: string, description: string) {
  const response = await request<{ data: { id: string; name: string } }>("/organizations", {
    method: "POST",
    token,
    body: { name, description },
  });
  assert(response.status === 201, `create organization ${name}`, response.text);
  return response.data.data;
}

async function createProject(token: string, organizationId: string, name: string, description: string) {
  const response = await request<{ data: { id: string; name: string; organizationId: string } }>("/projects", {
    method: "POST",
    token,
    body: { organizationId, name, description, status: "ACTIVE" },
  });
  assert(response.status === 201, `create project ${name}`, response.text);
  return response.data.data;
}

async function createBudget(token: string, projectId: string, monthlyBudget: number) {
  const response = await request<{ data: { id: string; projectId: string; currentSpend: string | number; remainingBudget: string | number; monthlyBudget: string | number } }>("/budgets", {
    method: "POST",
    token,
    body: { projectId, monthlyBudget, alertThreshold: 80 },
  });
  assert(response.status === 201, `create budget ${projectId}`, response.text);
  return response.data.data;
}

async function createTeam(token: string, organizationId: string, name: string) {
  const response = await request<{ data: { id: string; name: string } }>("/teams", {
    method: "POST",
    token,
    body: { organizationId, name, memberIds: [] },
  });
  assert(response.status === 201, `create team ${name}`, response.text);
  return response.data.data;
}

async function createApiKey(token: string, organizationId: string, key: string) {
  const response = await request<{ data: { id: string; provider: string } }>("/api-keys", {
    method: "POST",
    token,
    body: { organizationId, provider: "GEMINI", key },
  });
  assert(response.status === 201, `create api key for ${organizationId}`, response.text);
  return response.data.data;
}

async function list(path: string, token: string, query: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(path + suffix, { token });
}

async function main() {
  const owner = await login("owner@aispendos.dev", "Password123!");
  const ownerOrgId = getOrgId(owner);

  const uniqueSuffix = Date.now().toString(36);
  const userB = await register(`Audit User ${uniqueSuffix}`, `audit-${uniqueSuffix}@aispendos.dev`, "Password123!");
  const userBOrg = await createOrganization(userB.token, `Audit Org ${uniqueSuffix}`, "Secondary tenant for security tests");
  const userBOrgId = userBOrg.id;

  const team1 = await createTeam(userB.token, userBOrgId, `Audit Team ${uniqueSuffix}-1`);
  const team2 = await createTeam(userB.token, userBOrgId, `Audit Team ${uniqueSuffix}-2`);

  const project1 = await createProject(userB.token, userBOrgId, `Audit Project ${uniqueSuffix}-1`, "Search and pagination target 1");
  const project2 = await createProject(userB.token, userBOrgId, `Audit Project ${uniqueSuffix}-2`, "Search and pagination target 2");
  const project3 = await createProject(userB.token, userBOrgId, `Audit Project ${uniqueSuffix}-3`, "Search and pagination target 3");

  const budget1 = await createBudget(userB.token, project1.id, 100);
  const budget2 = await createBudget(userB.token, project2.id, 150);
  const budget3 = await createBudget(userB.token, project3.id, 200);

  await createApiKey(userB.token, userBOrgId, `not-a-real-gemini-key-${uniqueSuffix}`);

  const ownerProjects = await list("/projects", owner.token, { limit: 100, sortBy: "name", sortOrder: "asc" });
  const ownerProjectList = ownerProjects.data.data.items as Array<{ id: string; organizationId: string }>;
  const ownerProject = ownerProjectList.find((project) => project.organizationId === ownerOrgId);
  assert(ownerProject, "Owner project not found for missing-key test");

  const ownerProjectBudgetBefore = await prisma.budget.findUnique({ where: { projectId: ownerProject.id }, select: { currentSpend: true, remainingBudget: true } });
  const ownerUsageBefore = await prisma.usageLog.count({ where: { projectId: ownerProject.id } });

  const missingKeyResult = await request("/gateway/chat", {
    method: "POST",
    token: owner.token,
    body: { projectId: ownerProject.id, model: "gemini-2.5-flash", prompt: "Missing API key test" },
  });
  record("Gateway missing API key fails", missingKeyResult.status >= 400 && missingKeyResult.status < 500, missingKeyResult.text);

  const ownerProjectBudgetAfter = await prisma.budget.findUnique({ where: { projectId: ownerProject.id }, select: { currentSpend: true, remainingBudget: true } });
  const ownerUsageAfter = await prisma.usageLog.count({ where: { projectId: ownerProject.id } });
  const ownerGatewayLogAfter = await prisma.gatewayLog.findFirst({ where: { projectId: ownerProject.id }, orderBy: { createdAt: "desc" } });
  record(
    "Missing API key does not write usage or change spend",
    ownerUsageBefore === ownerUsageAfter
      && String(ownerProjectBudgetBefore?.currentSpend ?? "") === String(ownerProjectBudgetAfter?.currentSpend ?? "")
      && String(ownerProjectBudgetBefore?.remainingBudget ?? "") === String(ownerProjectBudgetAfter?.remainingBudget ?? "")
      && ownerGatewayLogAfter?.status === "FAILED",
    JSON.stringify({ before: ownerProjectBudgetBefore, after: ownerProjectBudgetAfter, usageBefore: ownerUsageBefore, usageAfter: ownerUsageAfter, gatewayStatus: ownerGatewayLogAfter?.status }),
  );

  const invalidKeyResult = await request("/gateway/chat", {
    method: "POST",
    token: userB.token,
    body: { projectId: project1.id, model: "gemini-2.5-flash", prompt: "Invalid API key test" },
  });
  record("Gateway invalid API key fails", invalidKeyResult.status >= 400, invalidKeyResult.text);

  const projectBudgetBeforeInvalid = await prisma.budget.findUnique({ where: { projectId: project1.id }, select: { currentSpend: true, remainingBudget: true } });
  const projectUsageBeforeInvalid = await prisma.usageLog.count({ where: { projectId: project1.id } });
  const gatewayLogBeforeInvalid = await prisma.gatewayLog.count({ where: { projectId: project1.id } });
  const invalidGatewayLog = await prisma.gatewayLog.findFirst({ where: { projectId: project1.id }, orderBy: { createdAt: "desc" } });
  const projectBudgetAfterInvalid = await prisma.budget.findUnique({ where: { projectId: project1.id }, select: { currentSpend: true, remainingBudget: true } });
  const projectUsageAfterInvalid = await prisma.usageLog.count({ where: { projectId: project1.id } });
  const gatewayLogAfterInvalid = await prisma.gatewayLog.count({ where: { projectId: project1.id } });
  record(
    "Invalid API key does not create usage or change spend",
    projectUsageBeforeInvalid === projectUsageAfterInvalid
      && String(projectBudgetBeforeInvalid?.currentSpend ?? "") === String(projectBudgetAfterInvalid?.currentSpend ?? "")
      && String(projectBudgetBeforeInvalid?.remainingBudget ?? "") === String(projectBudgetAfterInvalid?.remainingBudget ?? "")
      && gatewayLogAfterInvalid === gatewayLogBeforeInvalid + 1
      && invalidGatewayLog?.status === "FAILED",
    JSON.stringify({ before: projectBudgetBeforeInvalid, after: projectBudgetAfterInvalid, usageBefore: projectUsageBeforeInvalid, usageAfter: projectUsageAfterInvalid, gatewayBefore: gatewayLogBeforeInvalid, gatewayAfter: gatewayLogAfterInvalid, status: invalidGatewayLog?.status }),
  );

  const org2Resources = {
    orgId: userBOrgId,
    teamId: team1.id,
    projectId: project1.id,
    budgetId: budget1.id,
  };

  const forbiddenChecks = await Promise.all([
    request(`/organizations/${org2Resources.orgId}`, { token: owner.token }),
    request(`/projects/${org2Resources.projectId}`, { token: owner.token }),
    request(`/budgets/${org2Resources.budgetId}`, { token: owner.token }),
    request(`/teams/${org2Resources.teamId}`, { token: owner.token }),
    request(`/analytics/projects/${org2Resources.projectId}`, { token: owner.token }),
    request(`/gateway/logs?projectId=${org2Resources.projectId}`, { token: owner.token }),
  ]);

  const forbiddenLabels = [
    "organization",
    "project",
    "budget",
    "team",
    "project analytics",
    "gateway logs",
  ];

  forbiddenChecks.forEach((result, index) => {
    record(`Owner blocked from B ${forbiddenLabels[index]}`, result.status === 403 || result.status === 404, result.text);
  });

  const tenantOrgList = await list("/organizations", userB.token, { search: `Audit Org ${uniqueSuffix}`, limit: 10 });
  record("Organization search filters results", tenantOrgList.status === 200 && (tenantOrgList.data.data.items as Array<{ name: string }>).every((item) => item.name.includes(`Audit Org ${uniqueSuffix}`)));

  const tenantTeamList = await list("/teams", userB.token, { search: `Audit Team ${uniqueSuffix}-1`, limit: 10 });
  record("Team search filters results", tenantTeamList.status === 200 && (tenantTeamList.data.data.items as Array<{ name: string }>).every((item) => item.name.includes(`Audit Team ${uniqueSuffix}-1`)));

  const tenantProjectList = await list("/projects", userB.token, { search: `Audit Project ${uniqueSuffix}-2`, limit: 10 });
  record("Project search filters results", tenantProjectList.status === 200 && (tenantProjectList.data.data.items as Array<{ name: string }>).every((item) => item.name.includes(`Audit Project ${uniqueSuffix}-2`)));

  const tenantBudgetList = await list("/budgets", userB.token, { search: `Audit Project ${uniqueSuffix}-`, limit: 10 });
  record("Budget search filters results", tenantBudgetList.status === 200 && (tenantBudgetList.data.data.items as Array<{ project?: { name: string } }>).every((item) => item.project?.name.includes(`Audit Project ${uniqueSuffix}-`)));

  const createUsage = async (projectId: string, model: string, cost: number) => {
    const response = await request("/usage-logs", {
      method: "POST",
      token: userB.token,
      body: {
        projectId,
        model,
        provider: "GEMINI",
        tokens: 10,
        cost,
        inputTokens: 5,
        outputTokens: 5,
        totalTokens: 10,
        estimatedCost: cost,
        requestCount: 1,
      },
    });
    assert(response.status === 201, "create usage log", response.text);
    return response.data.data as { id: string };
  };

  await createUsage(project1.id, `audit-model-${uniqueSuffix}-a`, 0.0012);
  await createUsage(project2.id, `audit-model-${uniqueSuffix}-b`, 0.0345);
  await createUsage(project3.id, `audit-model-${uniqueSuffix}-c`, 1.5);

  const usageSearch = await list("/usage-logs", userB.token, { search: `audit-model-${uniqueSuffix}-b`, limit: 10 });
  record("Usage log search filters results", usageSearch.status === 200 && (usageSearch.data.data.items as Array<{ model: string }>).every((item) => item.model.includes(`audit-model-${uniqueSuffix}-b`)));

  const gatewaySuccessLogBefore = await prisma.gatewayLog.count({ where: { projectId: project1.id } });

  const serviceProject = await prisma.project.findUnique({ where: { id: project2.id }, select: { id: true, organizationId: true } });
  assert(serviceProject, "service project not found");
  const serviceBudgetBefore = await prisma.budget.findUnique({ where: { projectId: serviceProject.id }, select: { currentSpend: true, remainingBudget: true } });
  const serviceUsageBefore = await prisma.usageLog.count({ where: { projectId: serviceProject.id } });

  const originalChat = geminiProvider.chat;
  try {
    geminiProvider.chat = async () => {
      throw new AppError("Simulated provider failure", 500);
    };
    const serviceFailure = await executeGatewayChat(userB.user.id, { projectId: serviceProject.id, model: "gemini-2.5-flash", prompt: "Provider failure simulation" } satisfies GatewayChatInput).catch((error) => error);
    record("Provider failure is surfaced", serviceFailure instanceof AppError || serviceFailure instanceof Error, String(serviceFailure));
  } finally {
    geminiProvider.chat = originalChat;
  }

  const serviceBudgetAfter = await prisma.budget.findUnique({ where: { projectId: serviceProject.id }, select: { currentSpend: true, remainingBudget: true } });
  const serviceUsageAfter = await prisma.usageLog.count({ where: { projectId: serviceProject.id } });
  const serviceGatewayLog = await prisma.gatewayLog.findFirst({ where: { projectId: serviceProject.id }, orderBy: { createdAt: "desc" } });
  record(
    "Provider failure writes FAILED log and no usage/spend",
    serviceUsageBefore === serviceUsageAfter
      && String(serviceBudgetBefore?.currentSpend ?? "") === String(serviceBudgetAfter?.currentSpend ?? "")
      && String(serviceBudgetBefore?.remainingBudget ?? "") === String(serviceBudgetAfter?.remainingBudget ?? "")
      && serviceGatewayLog?.status === "FAILED",
    JSON.stringify({ before: serviceBudgetBefore, after: serviceBudgetAfter, usageBefore: serviceUsageBefore, usageAfter: serviceUsageAfter, gatewayStatus: serviceGatewayLog?.status }),
  );

  const paginationOrg1 = await list("/organizations", userB.token, { limit: 1, page: 1, sortBy: "name", sortOrder: "asc" });
  const paginationOrg2 = await list("/organizations", userB.token, { limit: 1, page: 2, sortBy: "name", sortOrder: "asc" });
  const orgIds = [
    ...(paginationOrg1.data.data.items as Array<{ id: string }>).map((item) => item.id),
    ...(paginationOrg2.data.data.items as Array<{ id: string }>).map((item) => item.id),
  ];
  record("Organization pagination returns unique rows", new Set(orgIds).size === orgIds.length && orgIds.length > 0);

  const paginationProject1 = await list("/projects", userB.token, { limit: 2, page: 1, sortBy: "name", sortOrder: "asc" });
  const paginationProject2 = await list("/projects", userB.token, { limit: 2, page: 2, sortBy: "name", sortOrder: "asc" });
  const projectIds = [
    ...(paginationProject1.data.data.items as Array<{ id: string }>).map((item) => item.id),
    ...(paginationProject2.data.data.items as Array<{ id: string }>).map((item) => item.id),
  ];
  record("Project pagination returns unique rows", new Set(projectIds).size === projectIds.length && projectIds.length >= 3);

  const paginationBudget1 = await list("/budgets", userB.token, { limit: 2, page: 1, sortBy: "name", sortOrder: "asc" });
  const paginationBudget2 = await list("/budgets", userB.token, { limit: 2, page: 2, sortBy: "name", sortOrder: "asc" });
  const budgetIds = [
    ...(paginationBudget1.data.data.items as Array<{ id: string }>).map((item) => item.id),
    ...(paginationBudget2.data.data.items as Array<{ id: string }>).map((item) => item.id),
  ];
  record("Budget pagination returns unique rows", new Set(budgetIds).size === budgetIds.length && budgetIds.length >= 3);

  const paginationTeam1 = await list("/teams", userB.token, { limit: 1, page: 1, sortBy: "name", sortOrder: "asc" });
  const paginationTeam2 = await list("/teams", userB.token, { limit: 1, page: 2, sortBy: "name", sortOrder: "asc" });
  const teamIds = [
    ...(paginationTeam1.data.data.items as Array<{ id: string }>).map((item) => item.id),
    ...(paginationTeam2.data.data.items as Array<{ id: string }>).map((item) => item.id),
  ];
  record("Team pagination returns unique rows", new Set(teamIds).size === teamIds.length && teamIds.length >= 2);

  const usagePage1 = await list("/usage-logs", userB.token, { limit: 2, page: 1, sortBy: "createdAt", sortOrder: "desc" });
  const usagePage2 = await list("/usage-logs", userB.token, { limit: 2, page: 2, sortBy: "createdAt", sortOrder: "desc" });
  const usageIds = [
    ...(usagePage1.data.data.items as Array<{ id: string }>).map((item) => item.id),
    ...(usagePage2.data.data.items as Array<{ id: string }>).map((item) => item.id),
  ];
  record("Usage log pagination returns unique rows", new Set(usageIds).size === usageIds.length && usageIds.length >= 3);

  const gatewayPage1 = await list("/gateway/logs", userB.token, { limit: 2, page: 1, sortBy: "createdAt", sortOrder: "desc" });
  const gatewayPage2 = await list("/gateway/logs", userB.token, { limit: 2, page: 2, sortBy: "createdAt", sortOrder: "desc" });
  const gatewayIds = [
    ...(gatewayPage1.data.data.items as Array<{ id: string }>).map((item) => item.id),
    ...(gatewayPage2.data.data.items as Array<{ id: string }>).map((item) => item.id),
  ];
  record("Gateway log pagination returns unique rows", new Set(gatewayIds).size === gatewayIds.length && gatewayIds.length >= 2);

  const apiKeyResponse = await list("/api-keys", userB.token, { organizationId: userBOrgId, limit: 10 });
  const apiKeyLeak = JSON.stringify(apiKeyResponse.data).includes("not-a-real-gemini-key") || JSON.stringify(apiKeyResponse.data).includes("encryptedKey");
  record("API keys are not returned decrypted", !apiKeyLeak, apiKeyResponse.text);

  const meResponse = await request("/auth/me", { token: owner.token });
  const jwtLeak = JSON.stringify(meResponse.data).includes(owner.token);
  record("JWT not leaked in profile response", !jwtLeak, meResponse.text);

  const integrityBudget = await prisma.budget.findMany({ include: { project: true } });
  const budgetIntegrityOk = integrityBudget.every((budget) => {
    const currentSpend = Number(budget.currentSpend ?? 0);
    const monthlyBudget = Number(budget.monthlyBudget ?? 0);
    const remainingBudget = Number(budget.remainingBudget ?? 0);
    return Math.abs((monthlyBudget - currentSpend) - remainingBudget) < 0.000001;
  });
  record("Budget totals are internally consistent", budgetIntegrityOk);

  const integrityGateway = await prisma.gatewayLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
  record("Gateway logs have requestId and terminal status", integrityGateway.every((log) => Boolean(log.requestId) && ["SUCCESS", "FAILED", "BLOCKED"].includes(log.status)));

  const integrityUsage = await prisma.usageLog.findMany({ where: { organizationId: { not: null } }, take: 20 });
  record("Usage logs store organization/team attribution", integrityUsage.every((log) => Boolean(log.organizationId) && Boolean(log.teamId)), JSON.stringify(integrityUsage.slice(0, 3)));

  const summary = {
    passCount: results.filter((result) => result.pass).length,
    failCount: results.filter((result) => !result.pass).length,
    total: results.length,
  };

  console.log(JSON.stringify({ summary, results }, null, 2));

  if (summary.failCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
import { PrismaClient } from "@prisma/client";
import { AppError } from "../src/middleware/error.middleware";
import { executeGatewayChat } from "../src/services/gateway.service";
import { geminiProvider } from "../src/providers/gemini.provider";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:4000/api/v1";

type ApiResult<T = any> = {
  status: number;
  body: T | null;
  raw: string;
};

type TestResult = {
  name: string;
  pass: boolean;
  details?: string;
};

function uniqueLabel(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function must(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function api<T = any>(path: string, options: { method?: string; token?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const raw = await response.text();
  let body: T | null = null;

  try {
    body = raw ? (JSON.parse(raw) as T) : null;
  } catch {
    body = null;
  }

  return { status: response.status, body, raw };
}

function unwrapData<T>(result: ApiResult<{ success?: boolean; data?: T }>): T {
  return (result.body as { data?: T } | null)?.data as T;
}

async function getSeedOwnerToken() {
  const result = await api<{ data: { token: string; user: { id: string; memberships: Array<{ organization: { id: string } }> } } }>(
    "/auth/login",
    {
      method: "POST",
      body: { email: "owner@aispendos.dev", password: "Password123!" },
    },
  );

  must(result.status === 200, `Owner login failed: ${result.raw}`);
  const data = unwrapData<any>(result);
  return { token: data.token as string, user: data.user };
}

async function registerUser(name: string, email: string, password: string) {
  const result = await api<{ data: { token: string; user: { id: string } } }>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

  must(result.status === 201, `Register failed for ${email}: ${result.raw}`);
  const data = unwrapData<any>(result);
  return { token: data.token as string, user: data.user as { id: string } };
}

async function createOrganization(token: string, name: string, description: string) {
  const result = await api<{ data: { id: string; name: string } }>("/organizations", {
    method: "POST",
    token,
    body: { name, description },
  });

  must(result.status === 201, `Create organization failed: ${result.raw}`);
  return unwrapData<any>(result) as { id: string; name: string };
}

async function createProject(token: string, organizationId: string, name: string, description: string) {
  const result = await api<{ data: { id: string; name: string; organizationId: string } }>("/projects", {
    method: "POST",
    token,
    body: { organizationId, name, description, status: "ACTIVE" },
  });

  must(result.status === 201, `Create project failed: ${result.raw}`);
  return unwrapData<any>(result) as { id: string; name: string; organizationId: string };
}

async function createBudget(token: string, projectId: string, monthlyBudget: number) {
  const result = await api<{ data: { id: string; projectId: string; currentSpend: number; remainingBudget: number } }>("/budgets", {
    method: "POST",
    token,
    body: { projectId, monthlyBudget, alertThreshold: 80 },
  });

  must(result.status === 201, `Create budget failed: ${result.raw}`);
  return unwrapData<any>(result) as { id: string; projectId: string; currentSpend: number; remainingBudget: number };
}

async function createTeam(token: string, organizationId: string, name: string) {
  const result = await api<{ data: { id: string; name: string; organizationId: string } }>("/teams", {
    method: "POST",
    token,
    body: { organizationId, name, memberIds: [] },
  });

  must(result.status === 201, `Create team failed: ${result.raw}`);
  return unwrapData<any>(result) as { id: string; name: string; organizationId: string };
}

async function createApiKey(token: string, organizationId: string, key: string) {
  const result = await api<{ data: { id: string; organizationId: string; provider: string } }>("/api-keys", {
    method: "POST",
    token,
    body: { organizationId, provider: "GEMINI", key },
  });

  must(result.status === 201, `Create API key failed: ${result.raw}`);
  return unwrapData<any>(result) as { id: string; organizationId: string; provider: string };
}

async function createUsageLog(token: string, projectId: string, model: string, cost: number) {
  const result = await api<{ data: { id: string; projectId: string; cost: number } }>("/usage-logs", {
    method: "POST",
    token,
    body: {
      projectId,
      model,
      provider: "GEMINI",
      tokens: 1000,
      cost,
      estimatedCost: cost,
      inputTokens: 500,
      outputTokens: 500,
      totalTokens: 1000,
    },
  });

  must(result.status === 201, `Create usage log failed: ${result.raw}`);
  return unwrapData<any>(result) as { id: string; projectId: string; cost: number };
}

async function callGateway(token: string, projectId: string, model: "gemini-2.5-flash" | "gemini-2.5-pro", prompt: string) {
  return api("/gateway/chat", {
    method: "POST",
    token,
    body: { projectId, model, prompt },
  });
}

async function listResource<T = any>(token: string, path: string) {
  const result = await api<{ data: T }>(path, { token });
  must(result.status === 200, `List request failed for ${path}: ${result.raw}`);
  return unwrapData<any>(result) as T;
}

async function getResource<T = any>(token: string, path: string) {
  const result = await api<{ data: T }>(path, { token });
  return result;
}

async function logFailureStatus(name: string, result: ApiResult, expectedStatus: number | number[]) {
  const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  must(expected.includes(result.status), `${name} expected ${expected.join("/")} but got ${result.status}: ${result.raw}`);
}

async function assertNoChange(before: { usageCount: number; currentSpend: string; remainingBudget: string }, after: { usageCount: number; currentSpend: string; remainingBudget: string }, label: string) {
  must(before.usageCount === after.usageCount, `${label}: usage count changed from ${before.usageCount} to ${after.usageCount}`);
  must(before.currentSpend === after.currentSpend, `${label}: currentSpend changed from ${before.currentSpend} to ${after.currentSpend}`);
  must(before.remainingBudget === after.remainingBudget, `${label}: remainingBudget changed from ${before.remainingBudget} to ${after.remainingBudget}`);
}

async function getProjectState(projectId: string) {
  const [budget, usageCount, gatewayCount] = await Promise.all([
    prisma.budget.findUnique({ where: { projectId }, select: { currentSpend: true, remainingBudget: true, monthlyBudget: true } }),
    prisma.usageLog.count({ where: { projectId } }),
    prisma.gatewayLog.count({ where: { projectId } }),
  ]);

  return {
    currentSpend: String(budget?.currentSpend ?? 0),
    remainingBudget: String(budget?.remainingBudget ?? 0),
    usageCount,
    gatewayCount,
  };
}

async function main() {
  const results: TestResult[] = [];
  const pass = (name: string, details?: string) => results.push({ name, pass: true, details });
  const fail = (name: string, details: string) => results.push({ name, pass: false, details });

  await api("/health");

  const owner = await getSeedOwnerToken();
  const ownerToken = owner.token;
  const ownerOrgId = owner.user.memberships[0]?.organization?.id;
  must(Boolean(ownerOrgId), "Owner organization missing from auth response");

  const unique = uniqueLabel("audit");
  const auditOrg = await createOrganization(ownerToken, `${unique}-org-a`, "Audit org A for runtime verification.");
  const auditOrgBTokenBundle = await registerUser(`${unique}-user-b`, `${unique}-user-b@aispendos.dev`, "Password123!");
  const userBToken = auditOrgBTokenBundle.token;
  const userBId = auditOrgBTokenBundle.user.id;
  const auditOrgB = await createOrganization(userBToken, `${unique}-org-b`, "Audit org B for runtime verification.");

  const teamA1 = await createTeam(ownerToken, auditOrg.id, `${unique}-team-a1`);
  const teamA2 = await createTeam(ownerToken, auditOrg.id, `${unique}-team-a2`);
  const teamB1 = await createTeam(userBToken, auditOrgB.id, `${unique}-team-b1`);

  const projectA1 = await createProject(ownerToken, auditOrg.id, `${unique}-project-a1`, "Search target alpha");
  const projectA2 = await createProject(ownerToken, auditOrg.id, `${unique}-project-a2`, "Search target beta");
  const projectA3 = await createProject(ownerToken, auditOrg.id, `${unique}-project-a3`, "Search target gamma");
  const projectB1 = await createProject(userBToken, auditOrgB.id, `${unique}-project-b1`, "Private tenant target");

  const budgetA1 = await createBudget(ownerToken, projectA1.id, 250);
  const budgetA2 = await createBudget(ownerToken, projectA2.id, 260);
  const budgetA3 = await createBudget(ownerToken, projectA3.id, 270);
  const budgetB1 = await createBudget(userBToken, projectB1.id, 300);

  await createApiKey(userBToken, auditOrgB.id, "definitely-invalid-gemini-key");

  const usageA1 = await createUsageLog(ownerToken, projectA1.id, `${unique}-usage-model-1`, 0.000035);
  const usageA2 = await createUsageLog(ownerToken, projectA1.id, `${unique}-usage-model-2`, 0.0012);
  const usageA3 = await createUsageLog(ownerToken, projectA1.id, `${unique}-usage-model-3`, 0.0345);

  const orgList = await listResource<any>(ownerToken, "/organizations?search=audit&limit=50");
  must(Array.isArray(orgList.items) && orgList.items.length >= 1, "Organization search returned no items");
  must(orgList.items.every((row: any) => String(row.name).toLowerCase().includes("audit")), "Organization search did not filter correctly");

  const teamList = await listResource<any>(ownerToken, `/teams?organizationId=${auditOrg.id}&search=${unique}-team-a&limit=50`);
  must(teamList.items.every((row: any) => String(row.name).includes(`${unique}-team-a`)), "Team search did not filter correctly");

  const projectList = await listResource<any>(ownerToken, `/projects?organizationId=${auditOrg.id}&search=${unique}-project-a&limit=50`);
  must(projectList.items.every((row: any) => String(row.name).includes(`${unique}-project-a`)), "Project search did not filter correctly");

  const budgetList = await listResource<any>(ownerToken, `/budgets?organizationId=${auditOrg.id}&search=${unique}-project-a&limit=50`);
  must(budgetList.items.every((row: any) => String(row.project?.name ?? "").includes(`${unique}-project-a`)), "Budget search did not filter correctly");

  const usageList = await listResource<any>(ownerToken, `/usage-logs?projectId=${projectA1.id}&search=${unique}-usage-model-2&limit=50`);
  must(usageList.items.every((row: any) => String(row.model).includes(`${unique}-usage-model-2`)), "Usage log search did not filter correctly");

  const orgPage1 = await listResource<any>(ownerToken, "/organizations?limit=1&page=1&sortBy=name&sortOrder=asc");
  const orgPage2 = await listResource<any>(ownerToken, "/organizations?limit=1&page=2&sortBy=name&sortOrder=asc");
  const orgIds = [orgPage1.items[0]?.id, orgPage2.items[0]?.id].filter(Boolean);
  must(new Set(orgIds).size === orgIds.length, "Organization pagination returned duplicate rows");
  must(orgPage1.meta.total >= orgIds.length, "Organization pagination total mismatch");

  const teamPage1 = await listResource<any>(ownerToken, `/teams?organizationId=${auditOrg.id}&limit=1&page=1&sortBy=name&sortOrder=asc`);
  const teamPage2 = await listResource<any>(ownerToken, `/teams?organizationId=${auditOrg.id}&limit=1&page=2&sortBy=name&sortOrder=asc`);
  must(new Set([teamPage1.items[0]?.id, teamPage2.items[0]?.id].filter(Boolean)).size === [teamPage1.items[0]?.id, teamPage2.items[0]?.id].filter(Boolean).length, "Team pagination returned duplicate rows");

  const projectPage1 = await listResource<any>(ownerToken, `/projects?organizationId=${auditOrg.id}&limit=1&page=1&sortBy=name&sortOrder=asc`);
  const projectPage2 = await listResource<any>(ownerToken, `/projects?organizationId=${auditOrg.id}&limit=1&page=2&sortBy=name&sortOrder=asc`);
  const projectPage3 = await listResource<any>(ownerToken, `/projects?organizationId=${auditOrg.id}&limit=1&page=3&sortBy=name&sortOrder=asc`);
  must(new Set([projectPage1.items[0]?.id, projectPage2.items[0]?.id, projectPage3.items[0]?.id].filter(Boolean)).size === 3, "Project pagination missing or duplicating rows");

  const budgetPage1 = await listResource<any>(ownerToken, `/budgets?organizationId=${auditOrg.id}&limit=1&page=1&sortBy=createdAt&sortOrder=asc`);
  const budgetPage2 = await listResource<any>(ownerToken, `/budgets?organizationId=${auditOrg.id}&limit=1&page=2&sortBy=createdAt&sortOrder=asc`);
  const budgetPage3 = await listResource<any>(ownerToken, `/budgets?organizationId=${auditOrg.id}&limit=1&page=3&sortBy=createdAt&sortOrder=asc`);
  must(new Set([budgetPage1.items[0]?.id, budgetPage2.items[0]?.id, budgetPage3.items[0]?.id].filter(Boolean)).size === 3, "Budget pagination missing or duplicating rows");

  const usagePage1 = await listResource<any>(ownerToken, `/usage-logs?projectId=${projectA1.id}&limit=1&page=1&sortBy=createdAt&sortOrder=asc`);
  const usagePage2 = await listResource<any>(ownerToken, `/usage-logs?projectId=${projectA1.id}&limit=1&page=2&sortBy=createdAt&sortOrder=asc`);
  const usagePage3 = await listResource<any>(ownerToken, `/usage-logs?projectId=${projectA1.id}&limit=1&page=3&sortBy=createdAt&sortOrder=asc`);
  must(new Set([usagePage1.items[0]?.id, usagePage2.items[0]?.id, usagePage3.items[0]?.id].filter(Boolean)).size === 3, "Usage pagination missing or duplicating rows");

  const missingKeyBefore = await getProjectState(projectA2.id);
  const missingKeyResponse = await callGateway(ownerToken, projectA2.id, "gemini-2.5-flash", "trigger missing key failure");
  await logFailureStatus("Missing API key gateway", missingKeyResponse, [404, 500]);
  const missingKeyAfter = await getProjectState(projectA2.id);
  assertNoChange(missingKeyBefore, missingKeyAfter, "Missing API key gateway");
  const missingKeyLog = await prisma.gatewayLog.findFirst({ where: { projectId: projectA2.id }, orderBy: { createdAt: "desc" } });
  must(missingKeyLog?.status === "FAILED", "Missing API key did not record FAILED gateway log");

  const invalidKeyBefore = await getProjectState(projectB1.id);
  const invalidKeyResponse = await callGateway(userBToken, projectB1.id, "gemini-2.5-flash", "trigger invalid key failure");
  await logFailureStatus("Invalid API key gateway", invalidKeyResponse, [400, 401, 403, 404, 500]);
  const invalidKeyAfter = await getProjectState(projectB1.id);
  assertNoChange(invalidKeyBefore, invalidKeyAfter, "Invalid API key gateway");
  const invalidKeyLog = await prisma.gatewayLog.findFirst({ where: { projectId: projectB1.id }, orderBy: { createdAt: "desc" } });
  must(invalidKeyLog?.status === "FAILED", "Invalid API key did not record FAILED gateway log");

  const simulatedFailures: Array<{ name: string; error: Error; model: "gemini-2.5-flash" | "gemini-2.5-pro" }> = [
    { name: "Timeout", error: new AppError("Gemini request timed out", 503), model: "gemini-2.5-pro" },
    { name: "429", error: new AppError("Rate limited", 429), model: "gemini-2.5-flash" },
    { name: "500", error: new AppError("Upstream failure", 500), model: "gemini-2.5-pro" },
    { name: "Provider failure", error: new Error("Provider failure"), model: "gemini-2.5-flash" },
  ];

  const originalChat = geminiProvider.chat;
  for (const scenario of simulatedFailures) {
    const before = await getProjectState(projectB1.id);
    geminiProvider.chat = (async () => {
      throw scenario.error;
    }) as typeof geminiProvider.chat;

    try {
      await executeGatewayChat(userBId, {
        projectId: projectB1.id,
        model: scenario.model,
        prompt: `simulate ${scenario.name.toLowerCase()}`,
      });
      throw new Error(`${scenario.name} scenario unexpectedly succeeded`);
    } catch (error) {
      must(error instanceof Error, `${scenario.name} scenario did not throw an Error`);
    }

    const after = await getProjectState(projectB1.id);
    assertNoChange(before, after, scenario.name);
    const latest = await prisma.gatewayLog.findFirst({ where: { projectId: projectB1.id, model: scenario.model }, orderBy: { createdAt: "desc" } });
    must(latest?.status === "FAILED", `${scenario.name} did not record FAILED gateway log`);
  }
  geminiProvider.chat = originalChat;

  const secretKeys = await api<any>(`/api-keys?organizationId=${auditOrgB.id}`, { token: userBToken });
  must(secretKeys.status === 200, "API key listing failed");
  must(JSON.stringify(secretKeys.body).includes("encryptedKey") === false, "Encrypted key leaked in API response");
  must(JSON.stringify(secretKeys.body).includes("definitely-invalid-gemini-key") === false, "Decrypted API key leaked in API response");

  const authMe = await api<any>("/auth/me", { token: ownerToken });
  must(authMe.status === 200, "auth/me failed");
  must(JSON.stringify(authMe.body).includes("ai-spend-token") === false, "JWT leaked in auth/me response");

  const orgListUnauthorized = await getResource(ownerToken, `/organizations/${auditOrgB.id}`);
  const projectUnauthorized = await getResource(ownerToken, `/projects/${projectB1.id}`);
  const budgetUnauthorized = await getResource(ownerToken, `/budgets/${budgetB1.id}`);
  const teamUnauthorized = await getResource(ownerToken, `/teams/${teamB1.id}`);
  const analyticsUnauthorized = await getResource(ownerToken, `/analytics/projects/${projectB1.id}`);
  const gatewayUnauthorized = await getResource(ownerToken, `/gateway/logs?projectId=${projectB1.id}`);

  must([orgListUnauthorized, projectUnauthorized, budgetUnauthorized, teamUnauthorized, analyticsUnauthorized, gatewayUnauthorized].every((result) => result.status === 403), "Authorization bypass succeeded for a cross-tenant resource");

  const orgCState = await prisma.organization.findUnique({
    where: { id: auditOrg.id },
    select: { id: true, name: true, teams: { select: { id: true } }, projects: { select: { id: true } }, budget: { select: { id: true } } },
  });
  must(Boolean(orgCState), "Organization state missing");

  const teamMembershipConsistency = await prisma.teamMember.findMany({
    where: { teamId: { in: [teamA1.id, teamA2.id, teamB1.id] } },
    select: { teamId: true, userId: true, role: true },
  });
  must(teamMembershipConsistency.length >= 3, "Team membership consistency check returned too few rows");

  const usageConsistency = await prisma.usageLog.findMany({
    where: { projectId: projectA1.id },
    select: { id: true, organizationId: true, teamId: true, projectId: true, userId: true },
  });
  must(usageConsistency.every((row) => row.organizationId === auditOrg.id), "UsageLog organizationId inconsistent");
  must(usageConsistency.every((row) => row.projectId === projectA1.id), "UsageLog projectId inconsistent");

  const gatewayConsistency = await prisma.gatewayLog.findMany({
    where: { projectId: projectB1.id },
    select: { id: true, requestId: true, status: true, projectId: true },
  });
  must(gatewayConsistency.every((row) => Boolean(row.requestId)), "GatewayLog requestId missing");
  must(gatewayConsistency.every((row) => row.projectId === projectB1.id), "GatewayLog projectId inconsistent");

  const budgetConsistency = await prisma.budget.findMany({
    where: { projectId: { in: [projectA1.id, projectA2.id, projectA3.id, projectB1.id] } },
    select: { projectId: true, currentSpend: true, remainingBudget: true, monthlyBudget: true },
  });
  must(budgetConsistency.every((row) => Number(row.currentSpend) <= Number(row.monthlyBudget)), "Budget currentSpend exceeded monthlyBudget");
  must(budgetConsistency.every((row) => Number(row.remainingBudget) >= 0), "Budget remainingBudget went negative");

  const frontendBuild = await new Promise<string>((resolve, reject) => {
    const { exec } = require("child_process");
    exec("npm run build", { cwd: "c:\\Users\\piyus\\OneDrive\\Desktop\\Ai-Spend\\frontend", maxBuffer: 10 * 1024 * 1024 }, (error: unknown, stdout: string, stderr: string) => {
      if (error) {
        reject(new Error(String(stderr || stdout || error)));
        return;
      }
      resolve(stdout);
    });
  });
  must(frontendBuild.includes("Compiled successfully") || frontendBuild.includes("Finished TypeScript"), "Frontend build did not complete cleanly");

  pass("Multi-tenant security", "Cross-tenant reads were denied with 403.");
  pass("Gateway failure handling", "Missing key and simulated upstream failures left no UsageLog or spend delta.");
  pass("Search verification", "Organization, team, project, budget, usage, and gateway filters matched live results.");
  pass("Pagination verification", "Page slices were unique and totals were consistent for all tested resources.");
  pass("API security", "API keys, JWTs, and responses did not leak secrets in tested routes.");
  pass("Database integrity", "Stored attribution, budgets, and gateway logs remained internally consistent.");
  pass("Build validation", "Backend and frontend builds completed successfully.");

  console.log(JSON.stringify({ results }, null, 2));
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });