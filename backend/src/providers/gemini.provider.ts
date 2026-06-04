import { AppError } from "@/middleware/error.middleware";
import type { AIProvider, AIProviderChatInput, AIProviderChatResult } from "@/providers/ai-provider.interface";

export type GeminiModel = "gemini-2.5-flash" | "gemini-2.5-pro";
const DEFAULT_TIMEOUT_MS = 45000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = 250;

function isRetryableStatus(status: number) {
  return status === 429 || status === 500 || status === 503;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiApi(apiKey: string, model: GeminiModel, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        // Use x-goog-api-key header for API keys per Google API guidance
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractMessage(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();

  if (text) {
    return text;
  }

  if (typeof data?.text === "string") {
    return data.text;
  }

  throw new AppError("Gemini response did not contain message text", 502);
}

function extractUsage(data: any) {
  const usageMetadata = data?.usageMetadata ?? {};
  const inputTokens = Number(usageMetadata.promptTokenCount ?? usageMetadata.inputTokenCount ?? 0);
  const outputTokens = Number(usageMetadata.candidatesTokenCount ?? usageMetadata.outputTokenCount ?? 0);
  const totalTokens = Number(usageMetadata.totalTokenCount ?? inputTokens + outputTokens);

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

export const geminiProvider: AIProvider = {
  provider: "GEMINI",
  async chat(input: AIProviderChatInput): Promise<AIProviderChatResult> {
    const model = input.model as GeminiModel;
    let lastError: AppError | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      let response: Response;

      try {
        response = await callGeminiApi(input.apiKey, model, input.prompt);
      } catch (error) {
        if (attempt < MAX_ATTEMPTS) {
          await wait(BACKOFF_MS * 2 ** (attempt - 1));
          continue;
        }

        throw new AppError(error instanceof Error && error.name === "AbortError" ? "Gemini request timed out" : "Gemini request failed", 503);
      }

      const rawBody = await response.text();
      let data: any;

      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (_error) {
        data = { rawBody };
      }

      if (response.ok) {
        return {
          message: extractMessage(data),
          usage: extractUsage(data),
          rawResponse: data,
        };
      }

      if (isRetryableStatus(response.status) && attempt < MAX_ATTEMPTS) {
        lastError = new AppError(data?.error?.message ?? "Gemini request failed", response.status);
        await wait(BACKOFF_MS * 2 ** (attempt - 1));
        continue;
      }

      throw new AppError(data?.error?.message ?? "Gemini request failed", response.status);
    }

    throw lastError ?? new AppError("Gemini request failed", 503);
  },
};
