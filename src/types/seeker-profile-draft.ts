import { z } from "zod";

// Deliberately small compared to the full Candidate shape — this is only
// what a plain-language conversation can reasonably gather in a handful of
// short questions from someone who may never have written a resume.
export const SeekerProfileDraftSchema = z.object({
  name: z.string(),
  contactDetails: z
    .string()
    .describe("Email or phone number employers can reach them through"),
  professionalTitle: z
    .string()
    .describe("Plain-language job title, e.g. 'Electrician' or 'House Cleaner'"),
  category: z.enum([
    "virtual_assistant",
    "customer_support",
    "bubble_developer",
    "graphic_designer",
    "bookkeeper",
    "sales_representative",
    "skilled_trade",
    "caregiving_domestic",
    "general_professional",
  ]),
  professionalSummary: z
    .string()
    .describe("2-3 sentences in the person's own words about what they do and are good at"),
  location: z.string().describe("City, Philippines"),
  yearsExperience: z.number(),
  skills: z.array(z.string()).min(1),
  languages: z
    .array(
      z.object({
        name: z.string(),
        proficiency: z.enum(["native", "fluent", "conversational"]),
      })
    )
    .describe("Default to Filipino (native) and English (conversational) unless stated otherwise"),
  availability: z.enum([
    "immediately",
    "within_2_weeks",
    "within_month",
    "not_available",
  ]),
  hoursPerWeek: z.enum(["full_time", "part_time", "flexible"]),
  workSetupNote: z
    .string()
    .optional()
    .describe("Only if relevant, e.g. 'onsite in Cebu' or 'remote only' — leave blank if not discussed"),
  mostRecentWork: z
    .object({
      role: z.string(),
      client: z.string(),
      duration: z.string(),
      description: z.string(),
    })
    .optional()
    .describe("Only include if the person mentioned a specific past job or client"),
});

export type SeekerProfileDraft = z.infer<typeof SeekerProfileDraftSchema>;
