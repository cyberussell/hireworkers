import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { candidates } from "@/lib/candidates";
import { fetchSeekerCandidateById } from "@/lib/db/seeker-candidates-db";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { PassportBody } from "@/components/passport/passport-body";
import type { Candidate } from "@/types/candidate";

export function generateStaticParams() {
  return candidates.map((candidate) => ({ id: candidate.id }));
}

async function findCandidate(id: string): Promise<Candidate | null> {
  const seedMatch = candidates.find((c) => c.id === id);
  if (seedMatch) return seedMatch;
  if (!isSupabaseConfigured()) return null;
  try {
    return await fetchSeekerCandidateById(id);
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
  const candidate = await findCandidate(id);
  if (!candidate) return { title: "Profile — Hire Workers That Work" };
  return {
    title: `${candidate.name} — ${candidate.professionalTitle} · Hire Workers That Work`,
    description: candidate.professionalSummary,
  };
}

export default async function CandidatePassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await findCandidate(id);
  if (!candidate) notFound();

  return <PassportBody candidate={candidate} />;
}
