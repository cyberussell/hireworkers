import { supabaseSelect, supabaseUpdateOne } from "@/lib/supabase-admin";
import type { Candidate, CandidateCategory, Availability } from "@/types/candidate";
import type { SeekerProfileDraft } from "@/types/seeker-profile-draft";

interface SeekerCandidateRow {
  id: string;
  name: string;
  professional_title: string;
  category: string;
  avatar_seed: string;
  professional_summary: string;
  location: string;
  years_experience: number;
  skills: string[];
  ai_skills_tags: string[];
  languages: Candidate["languages"];
  verified: Candidate["verified"];
  portfolio: Candidate["portfolio"];
  work_history: Candidate["workHistory"];
  certifications: Candidate["certifications"];
  assessments: Candidate["assessments"];
  availability: string;
  hours_per_week: string;
  last_active: string;
  response_rate: number;
  response_time_hours: number;
  references: Candidate["references"];
  featured: boolean;
  contact_details: string;
}

export function rowToCandidate(row: SeekerCandidateRow): Candidate {
  return {
    id: row.id,
    name: row.name,
    professionalTitle: row.professional_title,
    category: row.category as CandidateCategory,
    avatarSeed: row.avatar_seed,
    professionalSummary: row.professional_summary,
    location: row.location,
    yearsExperience: row.years_experience,
    skills: row.skills,
    aiSkillsTags: row.ai_skills_tags,
    languages: row.languages,
    verified: row.verified,
    portfolio: row.portfolio,
    workHistory: row.work_history,
    certifications: row.certifications,
    assessments: row.assessments,
    availability: row.availability as Availability,
    hoursPerWeek: row.hours_per_week as Candidate["hoursPerWeek"],
    lastActive: row.last_active,
    responseRate: row.response_rate,
    responseTimeHours: row.response_time_hours,
    references: row.references,
    featured: row.featured,
    selfSubmitted: true,
    contactDetails: row.contact_details,
  };
}

export async function fetchSeekerCandidateById(
  id: string
): Promise<Candidate | null> {
  const rows = await supabaseSelect<SeekerCandidateRow>(
    "seeker_candidates",
    `select=*&id=eq.${id}`
  );
  return rows[0] ? rowToCandidate(rows[0]) : null;
}

export async function fetchAllSeekerCandidates(): Promise<Candidate[]> {
  const rows = await supabaseSelect<SeekerCandidateRow>(
    "seeker_candidates",
    "select=*&order=created_at.desc"
  );
  return rows.map(rowToCandidate);
}

export async function fetchSeekerCandidateByUserId(
  userId: string
): Promise<Candidate | null> {
  const rows = await supabaseSelect<SeekerCandidateRow>(
    "seeker_candidates",
    `select=*&user_id=eq.${userId}`
  );
  return rows[0] ? rowToCandidate(rows[0]) : null;
}

export async function updateSeekerCandidateAssessments(
  userId: string,
  assessments: Candidate["assessments"]
): Promise<Candidate | null> {
  const row = await supabaseUpdateOne<SeekerCandidateRow>(
    "seeker_candidates",
    `user_id=eq.${userId}`,
    { assessments }
  );
  return row ? rowToCandidate(row) : null;
}

export function draftToRow(draft: SeekerProfileDraft, userId: string) {
  return {
    name: draft.name,
    professional_title: draft.professionalTitle,
    category: draft.category,
    avatar_seed: draft.name,
    professional_summary: draft.professionalSummary,
    location: draft.location,
    years_experience: draft.yearsExperience,
    skills: draft.skills,
    ai_skills_tags: [],
    languages: draft.languages,
    verified: { identity: false, email: false, phone: false },
    portfolio: [],
    work_history: draft.mostRecentWork ? [draft.mostRecentWork] : [],
    certifications: [],
    assessments: { skillAssessments: [] },
    availability: draft.availability,
    hours_per_week: draft.hoursPerWeek,
    response_rate: 0,
    response_time_hours: 0,
    references: [],
    contact_details: draft.contactDetails,
    user_id: userId,
  };
}
