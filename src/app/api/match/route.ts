import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import {
  buildMatchPrompt,
  buildMatchResultSchema,
  condenseCandidates,
} from "@/lib/ai/match-prompt";
import { candidates as seedCandidates } from "@/lib/candidates";
import { fetchAllSeekerCandidates } from "@/lib/db/seeker-candidates-db";
import {
  keywordMatchByBrief,
  keywordMatchByQuery,
} from "@/lib/keyword-match";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import type { Candidate } from "@/types/candidate";
import type { JobBrief } from "@/types/job-brief";

export const runtime = "nodejs";

type MatchRequestBody =
  | { mode: "brief"; jobBrief: JobBrief }
  | { mode: "query"; query: string };

export async function POST(request: Request) {
  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: MatchRequestBody;
  try {
    body = await request.json();
    if (body.mode !== "brief" && body.mode !== "query") {
      throw new Error("invalid mode");
    }
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  // Rank across the curated seed list AND real self-submitted profiles, so
  // AI matching reflects everyone who has actually built a profile via
  // /work, not just the demo data.
  let submitted: Candidate[] = [];
  if (isSupabaseConfigured()) {
    try {
      submitted = await fetchAllSeekerCandidates();
    } catch (error) {
      console.error("failed to load submitted candidates for matching", error);
    }
  }
  const allCandidates = [...seedCandidates, ...submitted];
  const candidateById = new Map(allCandidates.map((c) => [c.id, c]));

  if (!isAnthropicConfigured()) {
    return Response.json({
      results: withResolvedCandidates(fallbackResults(body, allCandidates), candidateById),
      degraded: true,
    });
  }

  try {
    const candidateIds = allCandidates.map((c) => c.id) as [string, ...string[]];
    const condensed = condenseCandidates(allCandidates);
    const prompt = buildMatchPrompt(condensed, body);

    const { object } = await generateObject({
      model: getAnthropicModel(),
      schema: buildMatchResultSchema(candidateIds),
      prompt,
    });

    const sorted = [...object.results].sort(
      (a, b) => b.matchScore - a.matchScore
    );
    return Response.json({
      results: withResolvedCandidates(sorted, candidateById),
    });
  } catch (error) {
    console.error("match ranking failed, falling back to keyword match", error);
    return Response.json({
      results: withResolvedCandidates(fallbackResults(body, allCandidates), candidateById),
      degraded: true,
    });
  }
}

function withResolvedCandidates(
  results: { candidateId: string; matchScore: number; matchReasons: string[] }[],
  candidateById: Map<string, Candidate>
) {
  return results
    .map((result) => {
      const candidate = candidateById.get(result.candidateId);
      if (!candidate) return null;
      return {
        candidate,
        matchScore: result.matchScore,
        matchReasons: result.matchReasons,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

function fallbackResults(body: MatchRequestBody, pool: Candidate[]) {
  const results =
    body.mode === "brief"
      ? keywordMatchByBrief(pool, body.jobBrief)
      : keywordMatchByQuery(pool, body.query);
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
