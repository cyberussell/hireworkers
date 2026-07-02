import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Route Handlers / Server Components,
 * scoped to the requesting user's session (anon key + cookies) — this is
 * NOT the service_role client in lib/supabase-admin.ts. Use this to verify
 * who's signed in; use the admin client for the actual data writes.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component without a mutable response
            // (e.g. during static rendering) — src/proxy.ts is responsible
            // for keeping the session cookie fresh in that case.
          }
        },
      },
    }
  );
}

/**
 * Verifies the caller's session against the Supabase Auth server (not just
 * the cookie's contents) and returns the authenticated user, or null. Use
 * this in POST/PATCH/DELETE Route Handlers that require sign-in.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
