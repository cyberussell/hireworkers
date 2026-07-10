import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const MISSION_CONTROL_COOKIE = "mc_session";
const TOKEN_VALUE = "authed";

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aHash = createHmac("sha256", a).update(a).digest();
  const bHash = createHmac("sha256", a).update(b).digest();
  return timingSafeEqual(aHash, bHash);
}

/** Checks the submitted username/password against ADMIN_USERNAME / ADMIN_PASSWORD.
 * Standalone from the site's Supabase Auth — this is its own admin login. */
export function isCorrectCredentials(
  username: string,
  password: string
): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;

  return (
    safeEqual(expectedUsername, username) && safeEqual(expectedPassword, password)
  );
}

/** Cookie value issued after correct credentials, scoped to ADMIN_PASSWORD so
 * it stops validating the moment the password is rotated. */
export function issueSessionToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return `${TOKEN_VALUE}.${sign(TOKEN_VALUE, secret)}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!token || !secret) return false;

  const [value, signature] = token.split(".");
  if (value !== TOKEN_VALUE || !signature) return false;

  const expected = sign(TOKEN_VALUE, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

/** Server-side guard for Mission Control API routes — checks the signed
 * session cookie set by /api/mission-control/auth. Not tied to Supabase Auth. */
export async function hasMissionControlSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(MISSION_CONTROL_COOKIE)?.value);
}
