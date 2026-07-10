import { fetchPendingMissingTradeRequests } from "@/lib/db/trade-catalog-db";
import { isAdminEmail } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "database_not_configured" }, { status: 503 });
  }

  const user = await requireUser();
  if (!isAdminEmail(user?.email)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const requests = await fetchPendingMissingTradeRequests();
    return Response.json({ requests });
  } catch (error) {
    console.error("failed to list missing trade requests", error);
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }
}
