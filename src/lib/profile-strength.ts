import type { Candidate } from "@/types/candidate";

const STRENGTH_FIELDS: Array<(candidate: Candidate) => boolean> = [
  (c) => c.name.trim().length > 0,
  (c) => Boolean(c.contactDetails?.trim()),
  (c) => c.professionalTitle.trim().length > 0,
  (c) => c.professionalSummary.trim().length > 0,
  (c) => c.location.trim().length > 0,
  (c) => c.yearsExperience > 0,
  (c) => c.skills.length > 0,
  (c) => c.availability !== "not_available",
];

export function computeProfileStrength(candidate: Candidate): number {
  const filled = STRENGTH_FIELDS.filter((check) => check(candidate)).length;
  return Math.round((filled / STRENGTH_FIELDS.length) * 100);
}

// A baseline reward for publishing at all, growing as portfolio pieces are
// added later (there's no portfolio-building flow yet, so this is mostly
// placeholder headroom for that feature).
export function computePortfolioStrength(candidate: Candidate): number {
  return Math.min(100, 20 + candidate.portfolio.length * 20);
}
