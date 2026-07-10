import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { candidates } from "@/lib/candidates";
import {
  fetchSeekerCandidateById,
  fetchSeekerCandidateByUserId,
  incrementSeekerCandidateViews,
} from "@/lib/db/seeker-candidates-db";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";
import { PassportBody } from "@/components/passport/passport-body";
import type { Candidate } from "@/types/candidate";

// Real, database-backed profiles need a fresh per-request fetch (auth-aware
// visibility check, view counting) — mixing that with statically prerendered
// seed pages on the same route template crashes at runtime ("Page changed
// from static to dynamic"). The ~16 seed profiles are cheap enough to render
// on demand too, so it's simplest to just make the whole route dynamic.
export const dynamic = "force-dynamic";

// Only real, database-backed profiles track views — the static seed
// profiles aren't real people and have nothing to view-count.
async function findCandidate(
  id: string
): Promise<{ candidate: Candidate; isSeed: boolean } | null> {
  const seedMatch = candidates.find((c) => c.id === id);
  if (seedMatch) return { candidate: seedMatch, isSeed: true };
  if (!isSupabaseConfigured()) return null;
  try {
    const candidate = await fetchSeekerCandidateById(id);
    return candidate ? { candidate, isSeed: false } : null;
  } catch {
    return null;
  }
}

// A saved-but-not-yet-published profile shouldn't be reachable by anyone
// but its owner, even with a direct link — treat it as not found otherwise.
// Also figures out ownership once here so the page doesn't have to look it
// up again for view-counting or showing an Edit button.
async function resolveVisibleCandidate(id: string): Promise<{
  candidate: Candidate;
  isSeed: boolean;
  isOwner: boolean;
} | null> {
  const found = await findCandidate(id);
  if (!found) return null;
  if (found.isSeed) return { ...found, isOwner: false };

  const viewer = await requireUser();
  const ownProfile = viewer
    ? await fetchSeekerCandidateByUserId(viewer.id).catch(() => null)
    : null;
  const isOwner = ownProfile?.id === found.candidate.id;

  if (!found.candidate.published && !isOwner) return null;

  return { ...found, isOwner };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const found = await resolveVisibleCandidate(id);
  if (!found) return { title: "Profile — Hire Workers That Work" };
  return {
    title: `${found.candidate.name} — ${found.candidate.professionalTitle} · Hire Workers That Work`,
    description: found.candidate.professionalSummary,
  };
}

export default async function CandidatePassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = await resolveVisibleCandidate(id);
  if (!found) notFound();

  if (!found.isSeed && !found.isOwner) {
    incrementSeekerCandidateViews(found.candidate.id, null).catch((error) =>
      console.error("failed to record profile view", error)
    );
  }

  return <PassportBody candidate={found.candidate} isOwner={found.isOwner} />;
}
