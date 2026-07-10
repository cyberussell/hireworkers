import { cookies } from "next/headers";
import {
  MISSION_CONTROL_COOKIE,
  isCorrectCredentials,
  issueSessionToken,
} from "@/lib/mission-control-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const { username, password } = (await request.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !isCorrectCredentials(username, password)
  ) {
    return Response.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = issueSessionToken();
  if (!token) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const cookieStore = await cookies();
  cookieStore.set(MISSION_CONTROL_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return Response.json({ ok: true });
}
