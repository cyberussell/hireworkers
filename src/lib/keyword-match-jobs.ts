import type { PostedJob } from "@/types/posted-job";

export interface JobMatchResult {
  jobId: string;
  matchScore: number;
  matchReasons: string[];
}

function wordsFromQuery(query: string) {
  return query.toLowerCase().split(/[^a-z0-9.]+/).filter(Boolean);
}

export function keywordMatchJobs(
  jobs: PostedJob[],
  query: string
): JobMatchResult[] {
  const words = wordsFromQuery(query);
  return jobs.map((job) => {
    const text = [
      job.brief.title,
      job.brief.summary,
      job.brief.requiredSkills.join(" "),
      job.brief.preferredSkills.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchedSkills = job.brief.requiredSkills.filter((skill) =>
      words.some((word) => skill.toLowerCase().includes(word))
    );
    const hitCount = words.reduce(
      (total, word) => total + (text.includes(word) ? 1 : 0),
      0
    );
    const matchScore = words.length
      ? Math.round((hitCount / words.length) * 100)
      : 0;

    return {
      jobId: job.id,
      matchScore,
      matchReasons: matchedSkills.length
        ? [`Matches on: ${matchedSkills.slice(0, 3).join(", ")}`]
        : [`Keyword overlap with ${job.brief.title}`],
    };
  });
}
