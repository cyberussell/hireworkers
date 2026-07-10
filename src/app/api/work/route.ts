import { streamText, type ModelMessage } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import { buildSeekerSystemPrompt } from "@/lib/ai/seeker-prompt";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { requireUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

type WorkRequestMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return Response.json({ error: "ai_not_configured" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let messages: WorkRequestMessage[];
  try {
    const body = await request.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("messages must be a non-empty array");
    }
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const modelMessages: ModelMessage[] = messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined);

  const result = streamText({
    model: getAnthropicModel(),
    system: buildSeekerSystemPrompt({ name, email: user.email }),
    messages: modelMessages,
  });

  return result.toTextStreamResponse();
}
