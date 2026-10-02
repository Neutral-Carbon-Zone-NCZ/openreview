import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { CompatibleLanguageModel } from "@workflow/ai/agent";
import type { LanguageModel } from "ai";
import { gateway } from "ai";

const DEFAULT_MODEL = "anthropic/claude-sonnet-4.6";

/**
 * Resolves the language model for the agent. Runs as a workflow step so the
 * provider instance is created where Node.js and env vars are available.
 *
 * - `OPENROUTER_API_KEY` set → routes through OpenRouter
 * - otherwise → Vercel AI Gateway (previous default behavior)
 * - `AI_MODEL` overrides the model id for either provider
 */
// oxlint-disable-next-line require-await -- "use step" functions must be async
export const resolveModel = async (): Promise<CompatibleLanguageModel> => {
  "use step";

  let model: LanguageModel;

  const modelId = process.env.AI_MODEL || DEFAULT_MODEL;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (apiKey) {
    const openrouter = createOpenRouter({
      apiKey,
      appName: "OpenReview",
      appUrl: "https://github.com/vercel-labs/openreview",
      // Sends stream_options.include_usage so token-based stop conditions work
      compatibility: "strict",
    });

    model = openrouter.chat(modelId);
  } else {
    model = gateway(modelId);
  }

  // @workflow/ai's CompatibleLanguageModel type pairs a v3 spec with v2 call
  // options; its runtime accepts AI SDK v6 (LanguageModelV3) models as-is.
  return model as unknown as CompatibleLanguageModel;
};
