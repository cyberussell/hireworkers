import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import { GrowthSuggestionsSchema, buildGrowthPrompt } from "@/lib/ai/growth-prompt";
import { fetchSeekerCandidateByUserId } from "@/lib/db/seeker-candidates-db";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }
  if (!isAnthropicConfigured()) {
    return Response.json({ error: "ai_not_configured" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const candidate = await fetchSeekerCandidateByUserId(user.id);
    if (!candidate) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    const { object } = await generateObject({
      model: getAnthropicModel(),
      schema: GrowthSuggestionsSchema,
      prompt: buildGrowthPrompt({
        professionalTitle: candidate.professionalTitle,
        category: candidate.category,
        skills: candidate.skills,
        yearsExperience: candidate.yearsExperience,
      }),
    });

    return Response.json(object);
  } catch (error) {
    console.error("failed to generate growth suggestions", error);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
