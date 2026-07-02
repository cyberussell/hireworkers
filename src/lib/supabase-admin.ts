const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Server-only Supabase REST client using the service_role key, which
 * bypasses RLS entirely. Never import this from a Client Component — the
 * key must never reach the browser. Every read/write to posted_jobs and
 * seeker_candidates goes through our own API routes, not direct
 * client-to-Supabase calls.
 */
async function supabaseRequest<T>(
  table: string,
  method: "GET" | "POST",
  options: { query?: string; body?: unknown } = {}
): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured");
  }

  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (options.query) url += `?${options.query}`;

  const response = await fetch(url, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${method} ${table} failed (${response.status}): ${detail}`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export function supabaseSelect<T>(table: string, query = "select=*") {
  return supabaseRequest<T[]>(table, "GET", { query });
}

export async function supabaseInsertOne<T>(
  table: string,
  row: Record<string, unknown>
): Promise<T> {
  const rows = await supabaseRequest<T[]>(table, "POST", { body: row });
  return rows[0];
}
