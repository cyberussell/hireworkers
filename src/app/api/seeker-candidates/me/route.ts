import {
  fetchSeekerCandidateByUserId,
  publishSeekerCandidate,
  updateSeekerCandidateAssessments,
  updateSeekerCandidateAvatar,
  updateSeekerCandidateProfile,
} from "@/lib/db/seeker-candidates-db";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";
import { validateProfileDraftFields } from "@/lib/validate-profile-draft";
import { AssessmentsSchema } from "@/types/assessments";
import { SeekerProfileDraftSchema } from "@/types/seeker-profile-draft";

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

  let body: {
    assessments?: unknown;
    draft?: unknown;
    publish?: unknown;
    avatarUrl?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  if (typeof body.avatarUrl === "string") {
    // Only accept URLs pointing at our own Supabase Storage "avatars"
    // bucket — never an arbitrary external image someone could post to a
    // public profile.
    const allowedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/`;
    if (!body.avatarUrl.startsWith(allowedPrefix)) {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }
    try {
      const candidate = await updateSeekerCandidateAvatar(
        user.id,
        body.avatarUrl
      );
      if (!candidate) {
        return Response.json({ error: "not_found" }, { status: 404 });
      }
      return Response.json({ candidate });
    } catch (error) {
      console.error("failed to update own seeker candidate avatar", error);
      return Response.json({ error: "update_failed" }, { status: 502 });
    }
  }

  if (body.publish === true) {
    try {
      const candidate = await publishSeekerCandidate(user.id);
      if (!candidate) {
        return Response.json({ error: "not_found" }, { status: 404 });
      }
      return Response.json({ candidate });
    } catch (error) {
      console.error("failed to publish own seeker candidate", error);
      return Response.json({ error: "update_failed" }, { status: 502 });
    }
  }

  if (body.draft !== undefined) {
    let draft;
    try {
      draft = SeekerProfileDraftSchema.parse(body.draft);
    } catch {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }

    const fieldErrors = validateProfileDraftFields(draft);
    if (fieldErrors.length > 0) {
      return Response.json(
        { error: "invalid_profile", details: fieldErrors },
        { status: 422 }
      );
    }

    try {
      const candidate = await updateSeekerCandidateProfile(user.id, draft);
      if (!candidate) {
        return Response.json({ error: "not_found" }, { status: 404 });
      }
      return Response.json({ candidate });
    } catch (error) {
      console.error("failed to update own seeker candidate profile", error);
      return Response.json({ error: "update_failed" }, { status: 502 });
    }
  }

  let assessments;
  try {
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
