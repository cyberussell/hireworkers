import { jobBriefToRow, rowToPostedJob } from "@/lib/db/posted-jobs-db";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { isSupabaseConfigured, supabaseInsertOne, supabaseSelect } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";
import { JobBriefSchema } from "@/types/job-brief";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }
  try {
    const rows = await supabaseSelect<Parameters<typeof rowToPostedJob>[0]>(
      "posted_jobs",
      "select=*&status=eq.active&order=created_at.desc"
    );
    return Response.json({ jobs: rows.map(rowToPostedJob) });
  } catch (error) {
    console.error("failed to list posted jobs", error);
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

  let brief;
  try {
    const body = await request.json();
    brief = JobBriefSchema.parse(body.brief);
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const row = await supabaseInsertOne<Parameters<typeof rowToPostedJob>[0]>(
      "posted_jobs",
      jobBriefToRow(brief, user.id)
    );
    return Response.json({ job: rowToPostedJob(row) }, { status: 201 });
  } catch (error) {
    console.error("failed to create posted job", error);
    return Response.json({ error: "insert_failed" }, { status: 502 });
  }
}
