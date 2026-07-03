import { z } from "zod";

export const AssessmentsSchema = z.object({
  typingSpeedWpm: z.number().optional(),
  communicationScore: z.number().optional(),
  skillAssessments: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      maxScore: z.number(),
    })
  ),
});

export type Assessments = z.infer<typeof AssessmentsSchema>;
