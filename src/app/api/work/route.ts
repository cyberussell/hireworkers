import { streamText, type ModelMessage } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import { SEEKER_CONVERSATION_SYSTEM_PROMPT } from "@/lib/ai/seeker-prompt";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

type WorkRequestMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return Response.json({ error: "ai_not_configured" }, { status: 503 });
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

  const result = streamText({
    model: getAnthropicModel(),
    system: SEEKER_CONVERSATION_SYSTEM_PROMPT,
    messages: modelMessages,
  });

  return result.toTextStreamResponse();
}
