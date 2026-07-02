import { createAnthropic } from "@ai-sdk/anthropic";

export const HIRE_MODEL_ID = "claude-sonnet-5";

export function isAnthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropicModel() {
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  return anthropic(HIRE_MODEL_ID);
}
