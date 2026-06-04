import { Provider } from "@prisma/client";
import { geminiProvider } from "@/providers/gemini.provider";
import { openaiProvider } from "@/providers/openai.provider";

const registry: Record<Provider, any> = {
  GEMINI: geminiProvider,
  OPENAI: openaiProvider,
  ANTHROPIC: undefined,
  GOOGLE: undefined,
  AZURE: undefined,
};

export function getProviderAdapter(provider: Provider) {
  const adapter = registry[provider];
  if (!adapter) throw new Error(`Provider adapter not registered for ${provider}`);
  return adapter;
}
