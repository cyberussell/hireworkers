import { draftToRow, fetchAllSeekerCandidates, rowToCandidate } from "@/lib/db/seeker-candidates-db";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { isSupabaseConfigured, supabaseInsertOne } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";
import { SeekerProfileDraftSchema } from "@/types/seeker-profile-draft";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }
  try {
    const candidates = await fetchAllSeekerCandidates();
    return Response.json({ candidates });
  } catch (error) {
    console.error("failed to list seeker candidates", error);
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let draft;
  try {
    const body = await request.json();
    draft = SeekerProfileDraftSchema.parse(body.draft);
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const row = await supabaseInsertOne<Parameters<typeof rowToCandidate>[0]>(
      "seeker_candidates",
      draftToRow(draft, user.id)
    );
    return Response.json({ candidate: rowToCandidate(row) }, { status: 201 });
  } catch (error) {
    console.error("failed to create seeker candidate", error);
    return Response.json({ error: "insert_failed" }, { status: 502 });
  }
}
