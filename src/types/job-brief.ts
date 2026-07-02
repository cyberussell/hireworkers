import { z } from "zod";

export const JobBriefSchema = z.object({
  companyName: z.string().describe("The employer's company or business name"),
  contactDetails: z
    .string()
    .describe("Email or phone number candidates should be matched through"),
  title: z.string().describe("A clear, specific job title"),
  summary: z.string().describe("A 1-2 sentence summary of the role"),
  responsibilities: z
    .array(z.string())
    .min(3)
    .describe("Concrete day-to-day responsibilities"),
  requiredSkills: z.array(z.string()).min(1),
  preferredSkills: z.array(z.string()),
  workSetup: z.enum(["remote", "hybrid", "onsite"]),
  scheduleType: z.enum(["full_time", "part_time", "contract", "flexible"]),
  suggestedSalary: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.literal("PHP"),
    period: z.enum(["hour", "month", "project"]),
  }),
  interviewQuestions: z
    .array(z.string())
    .min(3)
    .max(7)
    .describe("Specific, non-generic interview questions for this role"),
  assessmentRecommendations: z
    .array(z.string())
    .min(1)
    .describe("Concrete assessment types, e.g. 'Typing speed test'"),
});

export type JobBrief = z.infer<typeof JobBriefSchema>;
