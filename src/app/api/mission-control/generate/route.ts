import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import {
  AssessmentGenerationResultSchema,
  buildAssessmentGenerationPrompt,
} from "@/lib/ai/assessment-prompt";
import { GrowthSuggestionsSchema, buildGrowthPrompt } from "@/lib/ai/growth-prompt";
import {
  resolveMissingTradeRequests,
  upsertTradeCatalogEntry,
} from "@/lib/db/trade-catalog-db";
import { hasMissionControlSession } from "@/lib/mission-control-auth";
import { isSupabaseConfigured, supabaseSelect } from "@/lib/supabase-admin";
import type { CandidateCategory } from "@/types/candidate";

export const runtime = "nodejs";

function slugify(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "trade"
  );
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }
  if (!isAnthropicConfigured()) {
    return Response.json({ error: "ai_not_configured" }, { status: 503 });
  }

  if (!(await hasMissionControlSession())) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  let requestIds: string[];
  try {
    const body = await request.json();
    requestIds = Array.isArray(body.requestIds) ? body.requestIds : [];
    if (requestIds.length === 0) throw new Error("invalid body");
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const rows = await supabaseSelect<{
    professional_title: string;
    category: string;
  }>(
    "missing_trade_requests",
    `select=professional_title,category&id=in.(${requestIds.join(",")})`
  );
  const source = rows[0];
  if (!source) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const professionalTitle = source.professional_title;
  const category = source.category as CandidateCategory;
  const slug = slugify(professionalTitle);

  try {
    const [{ object: assessment }, { object: growth }] = await Promise.all([
      generateObject({
        model: getAnthropicModel(),
        schema: AssessmentGenerationResultSchema,
        prompt: buildAssessmentGenerationPrompt({
          professionalTitle,
          category,
          skills: [],
        }),
      }),
      generateObject({
        model: getAnthropicModel(),
        schema: GrowthSuggestionsSchema,
        prompt: buildGrowthPrompt({
          professionalTitle,
          category,
          skills: [],
          yearsExperience: 2,
        }),
      }),
    ]);

    await upsertTradeCatalogEntry({
      slug,
      displayName: professionalTitle,
      category,
      assessment,
      growth,
    });
    await resolveMissingTradeRequests(requestIds, slug);

    return Response.json({ slug });
  } catch (error) {
    console.error("mission control generation failed", error);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
