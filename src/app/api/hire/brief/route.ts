import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import { buildBriefExtractionPrompt } from "@/lib/ai/hire-prompt";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { JobBriefSchema } from "@/types/job-brief";

export const runtime = "nodejs";

type HireRequestMessage = {
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

  let messages: HireRequestMessage[];
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
    .map((m) => `${m.role === "assistant" ? "Assistant" : "Employer"}: ${m.content}`)
    .join("\n");

  try {
    const { object } = await generateObject({
      model: getAnthropicModel(),
      schema: JobBriefSchema,
      prompt: buildBriefExtractionPrompt(transcript),
    });

    return Response.json({ brief: object });
  } catch (error) {
    console.error("brief extraction failed", error);
    return Response.json({ error: "extraction_failed" }, { status: 502 });
  }
}
