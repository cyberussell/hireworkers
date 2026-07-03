import { z } from "zod";
import type { Candidate } from "@/types/candidate";
import type { JobBrief } from "@/types/job-brief";

export interface CondensedCandidate {
  candidateId: string;
  title: string;
  category: string;
  skills: string[];
  yearsExperience: number;
  availability: string;
  summary: string;
}

export function condenseCandidates(candidates: Candidate[]): CondensedCandidate[] {
  return candidates.map((c) => ({
    candidateId: c.id,
    title: c.professionalTitle,
    category: c.category,
    skills: c.skills,
    yearsExperience: c.yearsExperience,
    availability: c.availability,
    summary: c.professionalSummary,
  }));
}

export function buildMatchResultSchema(candidateIds: [string, ...string[]]) {
  return z.object({
    results: z
      .array(
        z.object({
          candidateId: z.enum(candidateIds),
          matchScore: z.number().min(0).max(100),
          matchReasons: z.array(z.string()).min(1).max(4),
        })
      )
      .describe(
        "One entry for every candidate in the input list, ranked most to least relevant."
      ),
  });
}

const MATCH_SYSTEM_PROMPT = `You are HireWorkers' AI candidate matching engine. You score how well each candidate fits what an employer is looking for.

Rules:
- Score and return EVERY candidate given to you — do not omit any candidateId.
- matchScore is 0-100. Be honest: a poor fit should score low (under 30), not be inflated.
- matchReasons must be short, specific, and grounded in the candidate's actual skills/summary/experience — never generic filler like "great fit for your team".
- Rank the results array from highest matchScore to lowest.`;

export function buildMatchPrompt(
  candidates: CondensedCandidate[],
  request: { mode: "brief"; jobBrief: JobBrief } | { mode: "query"; query: string }
) {
  const need =
    request.mode === "brief"
      ? `Employer's job brief:\n${JSON.stringify(request.jobBrief, null, 2)}`
      : `Employer's search query:\n"${request.query}"`;

  return `${MATCH_SYSTEM_PROMPT}

${need}

Candidates:
${JSON.stringify(candidates, null, 2)}`;
}
