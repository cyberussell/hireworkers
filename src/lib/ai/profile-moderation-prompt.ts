import { z } from "zod";

export const ProfilePlausibilityResultSchema = z.object({
  plausible: z.boolean(),
  reason: z.string().describe("One short sentence explaining the decision"),
});

export type ProfilePlausibilityResult = z.infer<
  typeof ProfilePlausibilityResultSchema
>;

export function buildProfilePlausibilityPrompt(draft: {
  name: string;
  contactDetails: string;
  professionalTitle: string;
  professionalSummary: string;
  skills: string[];
  location: string;
}) {
  return `You are checking whether a job seeker profile submitted to a Filipino hiring platform looks like real information from a real person, before it's saved to the database — not grading quality, English skill, or how impressive the work is.

Name: ${draft.name}
Contact: ${draft.contactDetails}
Work: ${draft.professionalTitle}
Summary: ${draft.professionalSummary}
Skills: ${draft.skills.join(", ")}
Location: ${draft.location}

Reject (plausible: false) ONLY if this is clearly gibberish, keyboard mashing, placeholder/test text (e.g. "asdf", "test test", "N/A"), spam, or an obviously fake/joke identity.

Do NOT reject for short answers, simple language, imperfect grammar, or lack of formal credentials — many people on this platform never finished school or have never written a profile before, and that is completely normal here. When in doubt, accept it.`;
}
