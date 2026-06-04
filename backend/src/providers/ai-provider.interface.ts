import type { Provider } from "@prisma/client";

export interface AIProviderUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AIProviderChatInput {
  apiKey: string;
  model: string;
  prompt: string;
}

export interface AIProviderChatResult {
  message: string;
  usage: AIProviderUsage;
  rawResponse?: unknown;
}

export interface AIProvider {
  provider: Provider;
  chat(input: AIProviderChatInput): Promise<AIProviderChatResult>;
}
