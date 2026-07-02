import type { JobBrief } from "@/types/job-brief";

export const JOB_BRIEF_STORAGE_KEY = "payjobs:hire:job-brief";

export function readStoredJobBrief(): JobBrief | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(JOB_BRIEF_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JobBrief) : null;
  } catch {
    return null;
  }
}
