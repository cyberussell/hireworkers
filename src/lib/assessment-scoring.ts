import type { Assessments } from "@/types/assessments";

export function upsertSkillAssessment(
  assessments: Assessments,
  entry: { name: string; score: number; maxScore: number }
): Assessments {
  return {
    ...assessments,
    skillAssessments: [
      ...assessments.skillAssessments.filter((s) => s.name !== entry.name),
      entry,
    ],
  };
}
