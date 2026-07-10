import { fetchMissionControlStats } from "@/lib/db/mission-control-stats-db";
import { hasMissionControlSession } from "@/lib/mission-control-auth";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }

  if (!(await hasMissionControlSession())) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const stats = await fetchMissionControlStats();
    return Response.json(stats);
  } catch (error) {
    console.error("failed to compute mission control stats", error);
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }
}
