import type { UIMessageChunk } from "ai";
import { getWritable } from "workflow";

import { createAgent } from "@/lib/agent";
import { parseError } from "@/lib/error";
import type { ThreadMessage } from "@/workflow";

import { discoverSkills } from "./discover-skills";
import { startTyping } from "./start-typing";

const MAX_TOTAL_TOKENS = 200_000;

// DurableAgent passes the provider's raw LanguageModelV3 usage through, where
// token counts are `{ total }` objects rather than the numbers the AI SDK
// types declare. Accept both shapes.
const countTokens = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "total" in value &&
    typeof value.total === "number"
  ) {
    return value.total;
  }

  return 0;
};

export interface AgentResult {
  errorMessage?: string;
  success: boolean;
}

export const runAgent = async (
  sandboxId: string,
  threadMessages: ThreadMessage[],
  threadId: string,
  prNumber: number,
  repoFullName: string
): Promise<AgentResult> => {
  try {
    await startTyping(threadId, "Reviewing...");

    const skills = await discoverSkills([".agents/skills"]);

    const agent = createAgent(
      sandboxId,
      threadId,
      prNumber,
      repoFullName,
      skills
    );

    await agent.stream({
      maxSteps: 20,
      messages: threadMessages.map((msg) => ({
        content: msg.content,
        role: msg.role,
      })),
      onStepFinish: (step) => {
        console.log(
          `[agent] step: ${countTokens(step.usage.inputTokens)} in / ${countTokens(step.usage.outputTokens)} out`
        );
      },
      prepareStep: ({ messages }) => {
        const trimmed = messages.map((msg) => {
          if (msg.role !== "tool" || !Array.isArray(msg.content)) {
            return msg;
          }

          return {
            ...msg,
            content: msg.content.map((part) => {
              if (part.type !== "tool-result") {
                return part;
              }

              const text = JSON.stringify(part.output);

              if (text.length <= 10_000) {
                return part;
              }

              return {
                ...part,
                output: {
                  type: "text" as const,
                  value: `${text.slice(0, 10_000)}\n\n... (truncated ${text.length - 10_000} chars)`,
                },
              };
            }),
          };
        });

        return { messages: trimmed };
      },
      stopWhen: [
        ({ steps }) => {
          let totalTokens = 0;

          for (const step of steps) {
            totalTokens +=
              countTokens(step.usage.inputTokens) +
              countTokens(step.usage.outputTokens);
          }

          return totalTokens > MAX_TOTAL_TOKENS;
        },
      ],
      writable: getWritable<UIMessageChunk>(),
    });

    return { success: true };
  } catch (error) {
    return {
      errorMessage: parseError(error),
      success: false,
    };
  }
};
