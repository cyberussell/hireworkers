import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import { buildProfileExtractionPrompt } from "@/lib/ai/seeker-prompt";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { SeekerProfileDraftSchema } from "@/types/seeker-profile-draft";

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

  const transcript = messages
    .map((m) => `${m.role === "assistant" ? "Assistant" : "Person"}: ${m.content}`)
    .join("\n");

  try {
    const { object } = await generateObject({
      model: getAnthropicModel(),
      schema: SeekerProfileDraftSchema,
      prompt: buildProfileExtractionPrompt(transcript),
    });

    return Response.json({ draft: object });
  } catch (error) {
    console.error("profile draft extraction failed", error);
    return Response.json({ error: "extraction_failed" }, { status: 502 });
  }
}
