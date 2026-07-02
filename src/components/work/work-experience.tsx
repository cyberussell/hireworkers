"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, UserRound } from "lucide-react";
import { ChatThread } from "@/components/hire/chat-thread";
import { ChatInput } from "@/components/hire/chat-input";
import { AiUnavailableBanner } from "@/components/hire/ai-unavailable-banner";
import { GenerationProgress } from "@/components/shared/generation-progress";
import { PanelPlaceholder } from "@/components/shared/panel-placeholder";
import { ProfileDraftCard } from "@/components/work/profile-draft-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { READY_FOR_PROFILE_SENTINEL } from "@/lib/ai/seeker-prompt";
import { readAndClearPendingProfileDraft } from "@/lib/pending-post";
import type { ChatMessage, HireStatus } from "@/types/chat";
import type { SeekerProfileDraft } from "@/types/seeker-profile-draft";

const PROFILE_STAGES = [
  "Listening to what you shared…",
  "Figuring out the right category…",
  "Writing your profile in your own words…",
  "Putting it all together…",
];

function makeId() {
  return crypto.randomUUID();
}

export function WorkExperience() {
  const hasWelcomed = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<HireStatus>("idle");
  const [readyForDraft, setReadyForDraft] = useState(false);
  const [draft, setDraft] = useState<SeekerProfileDraft | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  async function sendMessage(content: string) {
    const userMessage: ChatMessage = { id: makeId(), role: "user", content };
    const historyForRequest = [...messages, userMessage];
    setMessages(historyForRequest);

    const assistantId = makeId();
    setStatus("streaming");
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    let response: Response;
    try {
      response = await fetch("/api/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForRequest.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
    } catch {
      setStatus("error");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      return;
    }

    if (response.status === 503) {
      setStatus("ai_unavailable");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      return;
    }
    if (response.status === 429) {
      setStatus("rate_limited");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      return;
    }
    if (!response.ok || !response.body) {
      setStatus("error");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      const display = full.replace(READY_FOR_PROFILE_SENTINEL, "");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: display } : m
        )
      );
    }

    setStatus("idle");

    if (full.includes(READY_FOR_PROFILE_SENTINEL)) {
      setReadyForDraft(true);
      const finalMessages = historyForRequest.concat({
        id: assistantId,
        role: "assistant",
        content: full.replace(READY_FOR_PROFILE_SENTINEL, "").trim(),
      });
      void generateDraft(finalMessages);
    }
  }

  async function generateDraft(currentMessages: ChatMessage[]) {
    setDraftLoading(true);
    setDraftError(null);
    try {
      const response = await fetch("/api/work/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
      if (response.status === 503) {
        setStatus("ai_unavailable");
        return;
      }
      if (!response.ok) {
        setDraftError("Could not build your profile. Try again.");
        return;
      }
      const data = await response.json();
      setDraft(data.draft);
    } catch {
      setDraftError("Could not build your profile. Try again.");
    } finally {
      setDraftLoading(false);
    }
  }

  useEffect(() => {
    // Returning from a sign-in redirect with a draft already built takes
    // priority over the usual greeting. sessionStorage is client-only, so
    // this can't be read during render.
    const pending = readAndClearPendingProfileDraft();
    if (pending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(pending);
      hasWelcomed.current = true;
      return;
    }

    // A static greeting, not an AI call — no reason to spend a request just
    // to say hello, and it avoids putting words in the person's mouth as a
    // fake first "user" turn.
    if (!hasWelcomed.current) {
      hasWelcomed.current = true;
      setMessages([
        {
          id: makeId(),
          role: "assistant",
          content:
            "Hi! I'll help you build your profile — no forms, just tell me about your work. What kind of work do you do?",
        },
      ]);
    }
  }, []);

  const hasExchange = messages.some((m) => m.role === "user");
  const isStreaming = status === "streaming";
  const hasDraftSection = draftLoading || draftError || draft;

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Left: chat, fixed to the viewport so it scrolls internally like a
          chat app, on both mobile and desktop. */}
      <div className="flex h-[calc(100vh-4rem)] flex-col lg:w-1/2 lg:shrink-0 lg:border-r lg:border-border/60">
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground">
              <Sparkles className="size-6 text-primary" />
              <p>Let&apos;s build your profile together.</p>
            </div>
          ) : (
            <ChatThread messages={messages} isStreaming={isStreaming} />
          )}
        </div>

        <div className="mx-auto w-full max-w-2xl px-4 pb-3">
          {status === "ai_unavailable" && <AiUnavailableBanner />}
          {status === "rate_limited" && (
            <p className="mb-2 text-xs text-warning">
              That&apos;s a lot of messages at once — wait a moment and try again.
            </p>
          )}
          {status === "error" && (
            <p className="mb-2 text-xs text-danger">
              Something went wrong. Try sending that again.
            </p>
          )}
        </div>

        <div className="border-t border-border/60 bg-background px-4 pb-6 pt-4">
          <ChatInput
            disabled={isStreaming || status === "ai_unavailable"}
            onSend={sendMessage}
          />
          {hasExchange && !draft && !readyForDraft && (
            <div className="mx-auto mt-2 flex w-full max-w-2xl justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                disabled={isStreaming || draftLoading}
                onClick={() => void generateDraft(messages)}
              >
                Build my profile now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right: profile panel, side-by-side on desktop and independently
          scrollable; on mobile it only appears once there's something to
          show, stacked below the chat (matching the original layout). */}
      <div
        className={cn(
          "flex-1 px-4 py-6 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:px-8 lg:py-10",
          hasDraftSection
            ? "border-t border-border/60 lg:border-t-0"
            : "hidden lg:flex lg:items-center lg:justify-center"
        )}
      >
        {hasDraftSection ? (
          <>
            {draftLoading && (
              <GenerationProgress
                title="Building your profile"
                stages={PROFILE_STAGES}
              />
            )}
            {draftError && !draftLoading && (
              <p className="text-center text-sm text-danger">{draftError}</p>
            )}
            {draft && !draftLoading && (
              <ProfileDraftCard draft={draft} onChange={setDraft} />
            )}
          </>
        ) : (
          <PanelPlaceholder
            icon={UserRound}
            message="Your profile will show up here as we talk."
          />
        )}
      </div>
    </div>
  );
}
