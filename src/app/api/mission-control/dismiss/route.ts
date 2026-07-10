import { dismissMissingTradeRequest } from "@/lib/db/trade-catalog-db";
import { hasMissionControlSession } from "@/lib/mission-control-auth";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }

  if (!(await hasMissionControlSession())) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  let id: string;
  try {
    const body = await request.json();
    id = body.id;
    if (typeof id !== "string" || !id) throw new Error("invalid body");
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    await dismissMissingTradeRequest(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("failed to dismiss missing trade request", error);
    return Response.json({ error: "update_failed" }, { status: 502 });
  }
}
