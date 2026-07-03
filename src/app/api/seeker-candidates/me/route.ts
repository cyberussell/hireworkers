import {
  fetchSeekerCandidateByUserId,
  updateSeekerCandidateAssessments,
} from "@/lib/db/seeker-candidates-db";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";
import { AssessmentsSchema } from "@/types/assessments";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const candidate = await fetchSeekerCandidateByUserId(user.id);
    return Response.json({ candidate });
  } catch (error) {
    console.error("failed to fetch own seeker candidate", error);
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
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

  let assessments;
  try {
    const body = await request.json();
    assessments = AssessmentsSchema.parse(body.assessments);
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const candidate = await updateSeekerCandidateAssessments(user.id, assessments);
    if (!candidate) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json({ candidate });
  } catch (error) {
    console.error("failed to update own seeker candidate assessments", error);
    return Response.json({ error: "update_failed" }, { status: 502 });
  }
}
