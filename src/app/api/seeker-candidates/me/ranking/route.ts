import {
  fetchPublishedCandidatesByCategory,
  fetchSeekerCandidateByUserId,
} from "@/lib/db/seeker-candidates-db";
import { computeProfileStrength } from "@/lib/profile-strength";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";
import { CANDIDATE_CATEGORY_LABELS } from "@/types/candidate";

export const runtime = "nodejs";

// Below this many other published profiles in the same category, a
// percentile is more misleading than useful — say so plainly instead of
// making up a number from a sample of one or two people.
const MIN_PEERS_FOR_RANKING = 3;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const own = await fetchSeekerCandidateByUserId(user.id);
    if (!own) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    const peers = await fetchPublishedCandidatesByCategory(own.category);
    const peerStrengths = peers
      .filter((peer) => peer.id !== own.id)
      .map(computeProfileStrength);

    const categoryLabel = CANDIDATE_CATEGORY_LABELS[own.category];

    if (peerStrengths.length < MIN_PEERS_FOR_RANKING) {
      return Response.json({
        sufficientData: false,
        sampleSize: peerStrengths.length,
        categoryLabel,
      });
    }

    const ownStrength = computeProfileStrength(own);
    const rankedAtOrBelow = peerStrengths.filter((s) => s <= ownStrength).length;
    const percentile = Math.round(
      (rankedAtOrBelow / peerStrengths.length) * 100
    );

    return Response.json({
      sufficientData: true,
      percentile,
      sampleSize: peerStrengths.length,
      categoryLabel,
    });
  } catch (error) {
    console.error("failed to compute ranking", error);
    return Response.json({ error: "ranking_failed" }, { status: 502 });
  }
}
