import type { JobBrief } from "@/types/job-brief";
import type { SeekerProfileDraft } from "@/types/seeker-profile-draft";

const PENDING_JOB_BRIEF_KEY = "payjobs:pending-job-brief";
const PENDING_PROFILE_DRAFT_KEY = "payjobs:pending-profile-draft";

// Used to survive the full-page redirect an OAuth sign-in requires: stash
// the in-progress brief/draft right before opening the sign-in dialog, then
// restore it on the page the user's redirected back to so they don't lose
// their conversation just because they had to sign in.

export function stashPendingJobBrief(brief: JobBrief) {
  sessionStorage.setItem(PENDING_JOB_BRIEF_KEY, JSON.stringify(brief));
}

export function readAndClearPendingJobBrief(): JobBrief | null {
  const raw = sessionStorage.getItem(PENDING_JOB_BRIEF_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_JOB_BRIEF_KEY);
  try {
    return JSON.parse(raw) as JobBrief;
  } catch {
    return null;
  }
}

export function stashPendingProfileDraft(draft: SeekerProfileDraft) {
  sessionStorage.setItem(PENDING_PROFILE_DRAFT_KEY, JSON.stringify(draft));
}

export function readAndClearPendingProfileDraft(): SeekerProfileDraft | null {
  const raw = sessionStorage.getItem(PENDING_PROFILE_DRAFT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_PROFILE_DRAFT_KEY);
  try {
    return JSON.parse(raw) as SeekerProfileDraft;
  } catch {
    return null;
  }
}
