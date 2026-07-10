import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { candidates } from "@/lib/candidates";
import {
  fetchSeekerCandidateById,
  incrementSeekerCandidateViews,
} from "@/lib/db/seeker-candidates-db";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";
import { PassportBody } from "@/components/passport/passport-body";
import type { Candidate } from "@/types/candidate";

export function generateStaticParams() {
  return candidates.map((candidate) => ({ id: candidate.id }));
}

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const found = await findCandidate(id);
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
  const found = await findCandidate(id);
  if (!found) notFound();

  if (!found.isSeed) {
    const viewer = await requireUser();
    incrementSeekerCandidateViews(found.candidate.id, viewer?.id ?? null).catch(
      (error) => console.error("failed to record profile view", error)
    );
  }

  return <PassportBody candidate={found.candidate} />;
}
