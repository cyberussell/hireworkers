import { generateText } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import { candidates } from "@/lib/candidates";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import type { JobBrief } from "@/types/job-brief";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return Response.json({ error: "ai_not_configured" }, { status: 503 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let candidateId: string;
  let jobBrief: JobBrief;
  try {
    const body = await request.json();
    candidateId = body.candidateId;
    jobBrief = body.jobBrief;
    if (!candidateId || !jobBrief) throw new Error("missing fields");
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const { text } = await generateText({
      model: getAnthropicModel(),
      prompt: `An employer is hiring for this role:\n${JSON.stringify(jobBrief, null, 2)}\n\nHere is a candidate profile:\n${JSON.stringify(
        {
          title: candidate.professionalTitle,
          summary: candidate.professionalSummary,
          skills: candidate.skills,
          yearsExperience: candidate.yearsExperience,
          workHistory: candidate.workHistory,
        },
        null,
        2
      )}\n\nWrite 2-3 sentences, addressed to the employer, on why this candidate could be a good fit for this specific role. Be specific and honest — if there's a real gap (e.g. missing a required skill), mention it briefly rather than glossing over it. Do not use generic phrases like "great fit for your team".`,
    });

    return Response.json({ summary: text.trim() });
  } catch (error) {
    console.error("fit summary generation failed", error);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
