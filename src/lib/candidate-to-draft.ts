import type { Candidate } from "@/types/candidate";
import type { SeekerProfileDraft } from "@/types/seeker-profile-draft";

// Seeds the edit form from an already-published profile. Only carries over
// the fields the edit form actually exposes (see draftToUpdatePatch in
// seeker-candidates-db.ts) — anything else on Candidate is left untouched
// when the edit is saved.
export function candidateToDraft(candidate: Candidate): SeekerProfileDraft {
  return {
    name: candidate.name,
    contactDetails: candidate.contactDetails ?? "",
    professionalTitle: candidate.professionalTitle,
    category: candidate.category,
    professionalSummary: candidate.professionalSummary,
    location: candidate.location,
    address: candidate.address ?? candidate.location,
    yearsExperience: candidate.yearsExperience,
    skills: candidate.skills,
    languages: candidate.languages,
    availability: candidate.availability,
    hoursPerWeek: candidate.hoursPerWeek,
    rateType: candidate.rateType ?? "not_specified",
    dailyRate: candidate.dailyRate,
    governmentIdType: candidate.governmentIdType,
    governmentIdNumber: candidate.governmentIdNumber,
    paymentMethods: candidate.paymentMethods ?? [],
  };
}
