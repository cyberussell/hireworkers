import type { Candidate } from "@/types/candidate";
import { CANDIDATE_CATEGORY_LABELS } from "@/types/candidate";
import type { JobBrief } from "@/types/job-brief";

export interface MatchResult {
  candidateId: string;
  matchScore: number;
  matchReasons: string[];
}

function textFor(candidate: Candidate) {
  return [
    candidate.professionalTitle,
    CANDIDATE_CATEGORY_LABELS[candidate.category],
    candidate.professionalSummary,
    candidate.skills.join(" "),
    candidate.aiSkillsTags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function scoreAgainstWords(candidate: Candidate, words: string[]): MatchResult {
  const text = textFor(candidate);
  const matchedSkills = candidate.skills.filter((skill) =>
    words.some((word) => skill.toLowerCase().includes(word))
  );
  const hitCount = words.reduce(
    (total, word) => total + (text.includes(word) ? 1 : 0),
    0
  );
  const matchScore = words.length
    ? Math.round((hitCount / words.length) * 100)
    : 0;

  const matchReasons = matchedSkills.length
    ? [`Matches on: ${matchedSkills.slice(0, 3).join(", ")}`]
    : [`Keyword overlap with ${candidate.professionalTitle}`];

  return { candidateId: candidate.id, matchScore, matchReasons };
}

function wordsFromQuery(query: string) {
  return query.toLowerCase().split(/[^a-z0-9.]+/).filter(Boolean);
}

export function keywordMatchByQuery(
  candidates: Candidate[],
  query: string
): MatchResult[] {
  const words = wordsFromQuery(query);
  return candidates.map((candidate) => scoreAgainstWords(candidate, words));
}

export function keywordMatchByBrief(
  candidates: Candidate[],
  brief: JobBrief
): MatchResult[] {
  const words = wordsFromQuery(
    [brief.title, ...brief.requiredSkills, ...brief.preferredSkills].join(" ")
  );
  return candidates.map((candidate) => scoreAgainstWords(candidate, words));
}
