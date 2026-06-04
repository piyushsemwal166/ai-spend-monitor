import { AppError } from "@/middleware/error.middleware";
import type { AIProvider, AIProviderChatInput, AIProviderChatResult } from "@/providers/ai-provider.interface";

const DEFAULT_TIMEOUT_MS = 45000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = 250;

function isRetryableStatus(status: number) {
  return status === 429 || status === 500 || status === 503;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callOpenAiApi(apiKey: string, model: string, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1600,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }
}

export const openaiProvider: AIProvider = {
  provider: "OPENAI",
  async chat(input: AIProviderChatInput): Promise<AIProviderChatResult> {
    let lastError: AppError | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      let response: Response;

      try {
        response = await callOpenAiApi(input.apiKey, input.model, input.prompt);
      } catch (error) {
        if (attempt < MAX_ATTEMPTS) {
          await wait(BACKOFF_MS * 2 ** (attempt - 1));
          continue;
        }

        throw new AppError(error instanceof Error && error.name === "AbortError" ? "OpenAI request timed out" : "OpenAI request failed", 503);
      }

      const rawBody = await response.text();
      let data: any;

      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (_err) {
        data = { rawBody };
      }

      if (response.ok) {
        const message = data?.choices?.[0]?.message?.content ?? (typeof data?.text === "string" ? data.text : "");
        const usage = data?.usage ?? {};
        const inputTokens = Number(usage.prompt_tokens ?? usage.input_tokens ?? 0);
        const outputTokens = Number(usage.completion_tokens ?? usage.output_tokens ?? 0);
        const totalTokens = Number(usage.total_tokens ?? inputTokens + outputTokens);

        return {
          message: String(message).trim(),
          usage: { inputTokens, outputTokens, totalTokens },
          rawResponse: data,
        };
      }

      if (isRetryableStatus(response.status) && attempt < MAX_ATTEMPTS) {
        lastError = new AppError(data?.error?.message ?? "OpenAI request failed", response.status);
        await wait(BACKOFF_MS * 2 ** (attempt - 1));
        continue;
      }

      throw new AppError(data?.error?.message ?? "OpenAI request failed", response.status);
    }

    throw lastError ?? new AppError("OpenAI request failed", 503);
  },
};
