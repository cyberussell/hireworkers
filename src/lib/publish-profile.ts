import type { Candidate } from "@/types/candidate";
import type { SeekerProfileDraft } from "@/types/seeker-profile-draft";

export type PublishProfileResult =
  | { ok: true; candidate: Candidate }
  | { ok: false; status: number; reason?: string };

export async function publishProfileDraft(
  draft: SeekerProfileDraft
): Promise<PublishProfileResult> {
  try {
    const response = await fetch("/api/seeker-candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return {
        ok: false,
        status: response.status,
        reason: data?.reason ?? data?.details?.join(" "),
      };
    }
    const data = await response.json();
    return { ok: true, candidate: data.candidate as Candidate };
  } catch {
    return { ok: false, status: 0 };
  }
}

// Edits an already-published profile (name/summary/skills/etc. only — never
// touches portfolio, verification, or assessments accumulated since then).
export async function updateProfileDraft(
  draft: SeekerProfileDraft
): Promise<PublishProfileResult> {
  try {
    const response = await fetch("/api/seeker-candidates/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return {
        ok: false,
        status: response.status,
        reason: data?.reason ?? data?.details?.join(" "),
      };
    }
    const data = await response.json();
    return { ok: true, candidate: data.candidate as Candidate };
  } catch {
    return { ok: false, status: 0 };
  }
}
