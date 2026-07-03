import { z } from "zod";
import type { CandidateCategory } from "@/types/candidate";

export const AssessmentGenerationResultSchema = z.object({
  scenario: z.object({
    title: z
      .string()
      .describe("Short name for the scenario, e.g. 'Cracked Tile Repair Scenario'"),
    prompt: z
      .string()
      .describe("A realistic on-the-job situation for this specific trade/skill, written as a question asking what they'd do or say"),
  }),
  checklist: z.object({
    title: z
      .string()
      .describe("Short name for the checklist, e.g. 'Carpentry Tools & Skills Checklist'"),
    items: z
      .array(z.string())
      .min(5)
      .max(8)
      .describe("Specific tools, techniques, or practices relevant to this exact trade/skill — not generic office skills"),
  }),
});

export type AssessmentGenerationResult = z.infer<
  typeof AssessmentGenerationResultSchema
>;
export type GeneratedScenario = AssessmentGenerationResult["scenario"];
export type GeneratedChecklist = AssessmentGenerationResult["checklist"];

export function buildAssessmentGenerationPrompt({
  professionalTitle,
  category,
  skills,
}: {
  professionalTitle: string;
  category: CandidateCategory;
  skills: string[];
}) {
  return `You are building a short skills self-assessment for a Filipino worker on a hiring platform focused on skilled talent — many of whom never finished school or have no college degree. Never assume formal training or resume-speak; write in plain, respectful, everyday language.

This person's work: "${professionalTitle}" (category: ${category})
Skills they listed: ${skills.length > 0 ? skills.join(", ") : "not specified"}

Produce two things, both specific to THIS exact trade/skill — not generic office work unless their work genuinely is office work:
1. One realistic on-the-job scenario question testing judgment and know-how in their actual trade.
2. One checklist of 5-8 specific tools, techniques, or practices someone doing this work would recognize, so they can self-check what they know.

If this is a skilled trade (e.g. carpenter, electrician, driver, mechanic, welder) or caregiving/domestic work, focus entirely on hands-on, practical skills and safety — do not include office software, typing, or corporate scenarios.`;
}

export const ScenarioGradingResultSchema = z.object({
  score: z.number().min(0).max(100),
  maxScore: z.literal(100),
  feedback: z
    .string()
    .describe("1-2 sentences of specific, encouraging feedback in plain language"),
});

export type ScenarioGradingResult = z.infer<typeof ScenarioGradingResultSchema>;

export function buildScenarioGradingPrompt(
  scenarioPrompt: string,
  response: string
) {
  return `You are grading a short written response from a Filipino job seeker to a work scenario, as part of a skills self-assessment on a hiring platform. Grade for clarity, tone, and problem-solving — not for perfect grammar, since English may not be their first language.

Scenario given to them:
"${scenarioPrompt}"

Their written response:
"${response}"

Score from 0-100. A score around 60-75 is a normal, reasonable response; reserve 90+ for genuinely excellent, thorough answers, and go below 50 only if the response doesn't actually address the scenario. Give brief, specific, encouraging feedback in plain language — speak to them directly, not about them.`;
}
