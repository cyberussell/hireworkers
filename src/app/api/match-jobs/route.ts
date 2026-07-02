import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import {
  buildJobMatchPrompt,
  buildJobMatchResultSchema,
  condenseJobs,
} from "@/lib/ai/job-match-prompt";
import { rowToPostedJob } from "@/lib/db/posted-jobs-db";
import { keywordMatchJobs } from "@/lib/keyword-match-jobs";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { isSupabaseConfigured, supabaseSelect } from "@/lib/supabase-admin";
import type { PostedJob } from "@/types/posted-job";

export const runtime = "nodejs";

interface MatchJobsRequestBody {
  query: string;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: MatchJobsRequestBody;
  try {
    body = await request.json();
    if (typeof body.query !== "string") throw new Error("invalid body");
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  let jobs: PostedJob[];
  try {
    const rows = await supabaseSelect<Parameters<typeof rowToPostedJob>[0]>(
      "posted_jobs",
      "select=*&status=eq.active&order=created_at.desc"
    );
    jobs = rows.map(rowToPostedJob);
  } catch (error) {
    console.error("failed to load posted jobs for matching", error);
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }

  if (jobs.length === 0) {
    return Response.json({ results: [] });
  }

  const jobById = new Map(jobs.map((j) => [j.id, j]));

  if (!isAnthropicConfigured()) {
    return Response.json({
      results: withResolvedJobs(
        keywordMatchJobs(jobs, body.query).sort((a, b) => b.matchScore - a.matchScore),
        jobById
      ),
      degraded: true,
    });
  }

  try {
    const jobIds = jobs.map((j) => j.id) as [string, ...string[]];
    const condensed = condenseJobs(jobs);
    const prompt = buildJobMatchPrompt(condensed, body.query);

    const { object } = await generateObject({
      model: getAnthropicModel(),
      schema: buildJobMatchResultSchema(jobIds),
      prompt,
    });

    const sorted = [...object.results].sort(
      (a, b) => b.matchScore - a.matchScore
    );
    return Response.json({ results: withResolvedJobs(sorted, jobById) });
  } catch (error) {
    console.error("job match ranking failed, falling back to keyword match", error);
    return Response.json({
      results: withResolvedJobs(
        keywordMatchJobs(jobs, body.query).sort((a, b) => b.matchScore - a.matchScore),
        jobById
      ),
      degraded: true,
    });
  }
}

function withResolvedJobs(
  results: { jobId: string; matchScore: number; matchReasons: string[] }[],
  jobById: Map<string, PostedJob>
) {
  return results
    .map((result) => {
      const job = jobById.get(result.jobId);
      if (!job) return null;
      return {
        job,
        matchScore: result.matchScore,
        matchReasons: result.matchReasons,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}
