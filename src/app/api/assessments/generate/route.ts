import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import {
  AssessmentGenerationResultSchema,
  buildAssessmentGenerationPrompt,
} from "@/lib/ai/assessment-prompt";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import type { CandidateCategory } from "@/types/candidate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return Response.json({ error: "ai_not_configured" }, { status: 503 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let professionalTitle: string;
  let category: CandidateCategory;
  let skills: string[];
  try {
    const body = await request.json();
    professionalTitle = body.professionalTitle;
    category = body.category;
    skills = Array.isArray(body.skills) ? body.skills : [];
    if (typeof professionalTitle !== "string" || !professionalTitle.trim()) {
      throw new Error("invalid body");
    }
    if (typeof category !== "string" || !category.trim()) {
      throw new Error("invalid body");
    }
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: getAnthropicModel(),
      schema: AssessmentGenerationResultSchema,
      prompt: buildAssessmentGenerationPrompt({ professionalTitle, category, skills }),
    });

    return Response.json(object);
  } catch (error) {
    console.error("assessment generation failed", error);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
