import { z } from "zod";
import type { PostedJob } from "@/types/posted-job";

export interface CondensedJob {
  jobId: string;
  title: string;
  summary: string;
  requiredSkills: string[];
  workSetup: string;
  scheduleType: string;
}

export function condenseJobs(jobs: PostedJob[]): CondensedJob[] {
  return jobs.map((job) => ({
    jobId: job.id,
    title: job.brief.title,
    summary: job.brief.summary,
    requiredSkills: job.brief.requiredSkills,
    workSetup: job.brief.workSetup,
    scheduleType: job.brief.scheduleType,
  }));
}

export function buildJobMatchResultSchema(jobIds: [string, ...string[]]) {
  return z.object({
    results: z
      .array(
        z.object({
          jobId: z.enum(jobIds),
          matchScore: z.number().min(0).max(100),
          matchReasons: z.array(z.string()).min(1).max(4),
        })
      )
      .describe(
        "One entry for every job in the input list, ranked most to least relevant."
      ),
  });
}

const JOB_MATCH_SYSTEM_PROMPT = `You are PayJobs' AI job matching engine. You score how well each posted job fits what a job seeker in the Philippines is looking for.

Rules:
- Score and return EVERY job given to you — do not omit any jobId.
- matchScore is 0-100. Be honest: a poor fit should score low (under 30), not be inflated.
- matchReasons must be short, specific, and grounded in the job's actual title/skills/summary — never generic filler.
- Rank the results array from highest matchScore to lowest.`;

export function buildJobMatchPrompt(jobs: CondensedJob[], query: string) {
  return `${JOB_MATCH_SYSTEM_PROMPT}

Job seeker's search:
"${query}"

Posted jobs:
${JSON.stringify(jobs, null, 2)}`;
}
