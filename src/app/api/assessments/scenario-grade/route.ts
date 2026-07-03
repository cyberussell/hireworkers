import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import {
  ScenarioGradingResultSchema,
  buildScenarioGradingPrompt,
} from "@/lib/ai/assessment-prompt";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 2000;

function isValidField(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= MAX_FIELD_LENGTH
  );
}

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return Response.json({ error: "ai_not_configured" }, { status: 503 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let scenarioTitle: string;
  let scenarioPrompt: string;
  let response: string;
  try {
    const body = await request.json();
    scenarioTitle = body.scenarioTitle;
    scenarioPrompt = body.scenarioPrompt;
    response = body.response;
    if (
      !isValidField(scenarioTitle) ||
      !isValidField(scenarioPrompt) ||
      !isValidField(response)
    ) {
      throw new Error("invalid body");
    }
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: getAnthropicModel(),
      schema: ScenarioGradingResultSchema,
      prompt: buildScenarioGradingPrompt(scenarioPrompt, response),
    });

    return Response.json({ result: object });
  } catch (error) {
    console.error("scenario grading failed", error);
    return Response.json({ error: "grading_failed" }, { status: 502 });
  }
}
