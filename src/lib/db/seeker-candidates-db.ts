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
  address: string | null;
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
  profile_views: number | null;
  rate_type: string | null;
  daily_rate: number | null;
  avatar_url: string | null;
  published: boolean | null;
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
    address: row.address ?? undefined,
    profileViews: row.profile_views ?? 0,
    rateType: (row.rate_type ?? "not_specified") as Candidate["rateType"],
    dailyRate: row.daily_rate ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    published: row.published ?? true,
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

// Only published profiles are visible to employers browsing Find Talent —
// a saved-but-not-yet-published profile is only reachable by its owner via
// fetchSeekerCandidateByUserId.
export async function fetchAllSeekerCandidates(): Promise<Candidate[]> {
  const rows = await supabaseSelect<SeekerCandidateRow>(
    "seeker_candidates",
    "select=*&published=eq.true&order=created_at.desc"
  );
  return rows.map(rowToCandidate);
}

// Used to benchmark one candidate against others doing the same kind of
// work — only published profiles count as the real, comparable talent pool.
export async function fetchPublishedCandidatesByCategory(
  category: CandidateCategory
): Promise<Candidate[]> {
  const rows = await supabaseSelect<SeekerCandidateRow>(
    "seeker_candidates",
    `select=*&published=eq.true&category=eq.${category}`
  );
  return rows.map(rowToCandidate);
}

// Homepage stat strip only needs a count, not full rows.
export async function countPublishedSeekerCandidates(): Promise<number> {
  const rows = await supabaseSelect<{ id: string }>(
    "seeker_candidates",
    "select=id&published=eq.true"
  );
  return rows.length;
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

// Deliberately narrower than draftToRow: an edit only touches the fields
// the edit form actually exposes, so it never clobbers portfolio,
// verification, assessments, or response stats accumulated since creation.
function draftToUpdatePatch(draft: SeekerProfileDraft) {
  return {
    name: draft.name,
    professional_title: draft.professionalTitle,
    category: draft.category,
    professional_summary: draft.professionalSummary,
    location: draft.location,
    address: draft.address,
    years_experience: draft.yearsExperience,
    skills: draft.skills,
    languages: draft.languages,
    availability: draft.availability,
    hours_per_week: draft.hoursPerWeek,
    contact_details: draft.contactDetails,
    rate_type: draft.rateType,
    daily_rate: draft.rateType === "daily" ? draft.dailyRate ?? null : null,
  };
}

export async function updateSeekerCandidateProfile(
  userId: string,
  draft: SeekerProfileDraft
): Promise<Candidate | null> {
  const row = await supabaseUpdateOne<SeekerCandidateRow>(
    "seeker_candidates",
    `user_id=eq.${userId}`,
    draftToUpdatePatch(draft)
  );
  return row ? rowToCandidate(row) : null;
}

export async function updateSeekerCandidateAvatar(
  userId: string,
  avatarUrl: string
): Promise<Candidate | null> {
  const row = await supabaseUpdateOne<SeekerCandidateRow>(
    "seeker_candidates",
    `user_id=eq.${userId}`,
    { avatar_url: avatarUrl }
  );
  return row ? rowToCandidate(row) : null;
}

export async function publishSeekerCandidate(
  userId: string
): Promise<Candidate | null> {
  const row = await supabaseUpdateOne<SeekerCandidateRow>(
    "seeker_candidates",
    `user_id=eq.${userId}`,
    { published: true }
  );
  return row ? rowToCandidate(row) : null;
}

// Best-effort read-then-write increment — a lost update under concurrent
// views just means an occasional undercount, which is fine for a "people
// have seen your profile" vanity stat. Skips the profile owner's own visits
// so checking your own public link doesn't inflate the count.
export async function incrementSeekerCandidateViews(
  id: string,
  viewerUserId: string | null
): Promise<void> {
  const rows = await supabaseSelect<
    Pick<SeekerCandidateRow, "profile_views"> & { user_id: string | null }
  >("seeker_candidates", `select=profile_views,user_id&id=eq.${id}`);
  const row = rows[0];
  if (!row) return;
  if (viewerUserId && row.user_id === viewerUserId) return;

  await supabaseUpdateOne<SeekerCandidateRow>(
    "seeker_candidates",
    `id=eq.${id}`,
    { profile_views: (row.profile_views ?? 0) + 1 }
  );
}

export function draftToRow(
  draft: SeekerProfileDraft,
  userId: string,
  avatarUrl?: string | null
) {
  return {
    name: draft.name,
    professional_title: draft.professionalTitle,
    category: draft.category,
    avatar_seed: draft.name,
    avatar_url: avatarUrl ?? null,
    professional_summary: draft.professionalSummary,
    location: draft.location,
    address: draft.address,
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
    rate_type: draft.rateType,
    daily_rate: draft.rateType === "daily" ? draft.dailyRate ?? null : null,
    response_rate: 0,
    response_time_hours: 0,
    references: [],
    contact_details: draft.contactDetails,
    user_id: userId,
    // Saved privately by default — the person explicitly publishes when
    // they're ready for employers to find them.
    published: false,
  };
}
