import { z } from "zod";
import type { CandidateCategory } from "@/types/candidate";

export const GrowthSuggestionsSchema = z.object({
  suggestions: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            "A specific skill, tool, or certification relevant to their exact trade — not generic advice"
          ),
        reason: z
          .string()
          .describe("One plain-language sentence on why this makes them more competitive"),
        whereToLearn: z
          .string()
          .describe(
            "A real, concrete, accessible way to learn it in the Philippines — a specific TESDA program, a named free YouTube channel, or a named platform. Never say vague things like 'search online' or 'look it up'."
          ),
      })
    )
    .min(2)
    .max(4),
});

export type GrowthSuggestions = z.infer<typeof GrowthSuggestionsSchema>;

export function buildGrowthPrompt({
  professionalTitle,
  category,
  skills,
  yearsExperience,
}: {
  professionalTitle: string;
  category: CandidateCategory;
  skills: string[];
  yearsExperience: number;
}) {
  return `You help Filipino workers on a skills-based hiring platform figure out what to learn next to become more competitive — many have no college degree or formal training, so suggestions must be realistic and genuinely accessible, not academic.

Their work: "${professionalTitle}" (category: ${category})
Years doing this: ${yearsExperience}
Skills they already listed: ${skills.length > 0 ? skills.join(", ") : "not specified"}

Suggest 2-4 specific skills, tools, or certifications that would make them more competitive for this exact trade — build on what they already know, don't repeat it. For each one, give a real, concrete way to learn it in the Philippines: a named TESDA program, a specific free YouTube channel, a named platform (e.g. Coursera, Meta Blueprint, Google Digital Garage), or a recognized certification body. Be specific and real — never vague ("search online," "look it up").`;
}
