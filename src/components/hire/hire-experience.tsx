"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase, Sparkles } from "lucide-react";
import { ChatThread } from "@/components/hire/chat-thread";
import { ChatInput } from "@/components/hire/chat-input";
import { JobBriefCard } from "@/components/hire/job-brief-card";
import { AiUnavailableBanner } from "@/components/hire/ai-unavailable-banner";
import { GenerationProgress } from "@/components/shared/generation-progress";
import { PanelPlaceholder } from "@/components/shared/panel-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { READY_FOR_BRIEF_SENTINEL } from "@/lib/ai/hire-prompt";
import { readAndClearPendingJobBrief } from "@/lib/pending-post";
import type { ChatMessage, HireStatus } from "@/types/chat";
import type { JobBrief } from "@/types/job-brief";

function makeId() {
  return crypto.randomUUID();
}

export function HireExperience() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("q");
  const hasAutoSent = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<HireStatus>("idle");
  const [readyForBrief, setReadyForBrief] = useState(false);
  const [brief, setBrief] = useState<JobBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

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
      response = await fetch("/api/hire", {
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
      const display = full.replace(READY_FOR_BRIEF_SENTINEL, "");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: display } : m
        )
      );
    }

    setStatus("idle");

    if (full.includes(READY_FOR_BRIEF_SENTINEL)) {
      setReadyForBrief(true);
      const finalMessages = historyForRequest.concat({
        id: assistantId,
        role: "assistant",
        content: full.replace(READY_FOR_BRIEF_SENTINEL, "").trim(),
      });
      void generateBrief(finalMessages);
    }
  }

  async function generateBrief(currentMessages: ChatMessage[]) {
    setBriefLoading(true);
    setBriefError(null);
    try {
      const response = await fetch("/api/hire/brief", {
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
        setBriefError("Could not generate the job brief. Try again.");
        return;
      }
      const data = await response.json();
      setBrief(data.brief);
    } catch {
      setBriefError("Could not generate the job brief. Try again.");
    } finally {
      setBriefLoading(false);
    }
  }

  useEffect(() => {
    // Returning from a sign-in redirect with a brief already drafted takes
    // priority over starting a fresh conversation from a homepage prompt.
    // sessionStorage is client-only, so this can't be read during render.
    const pending = readAndClearPendingJobBrief();
    if (pending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBrief(pending);
      return;
    }
    if (initialPrompt && !hasAutoSent.current) {
      hasAutoSent.current = true;
      void sendMessage(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const hasExchange = messages.some((m) => m.role === "assistant");
  const isStreaming = status === "streaming";

  if (status === "ai_unavailable" && messages.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-10">
        <AiUnavailableBanner />
      </div>
    );
  }

  const hasBriefSection = briefLoading || briefError || brief;

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Left: chat, fixed to the viewport so it scrolls internally like a
          chat app, on both mobile and desktop. */}
      <div className="flex h-[calc(100vh-4rem)] flex-col lg:w-1/2 lg:shrink-0 lg:border-r lg:border-border/60">
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground">
              <Sparkles className="size-6 text-primary" />
              <p>Tell me who you&apos;re hiring for and I&apos;ll take it from there.</p>
            </div>
          ) : (
            <ChatThread messages={messages} isStreaming={isStreaming} />
          )}
        </div>

        <div className="mx-auto w-full max-w-2xl px-4 pb-3">
          {status === "ai_unavailable" && <AiUnavailableBanner />}
          {status === "rate_limited" && (
            <p className="mb-2 text-xs text-warning">
              You&apos;re sending messages too quickly — wait a moment and try again.
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
          {hasExchange && !brief && !readyForBrief && (
            <div className="mx-auto mt-2 flex w-full max-w-2xl justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                disabled={isStreaming || briefLoading}
                onClick={() => void generateBrief(messages)}
              >
                Generate job brief now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right: job brief panel, side-by-side on desktop and independently
          scrollable; on mobile it only appears once there's something to
          show, stacked below the chat (matching the original layout). */}
      <div
        className={cn(
          "flex-1 px-4 py-6 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:px-8 lg:py-10",
          hasBriefSection
            ? "border-t border-border/60 lg:border-t-0"
            : "hidden lg:flex lg:items-center lg:justify-center"
        )}
      >
        {hasBriefSection ? (
          <>
            {briefLoading && <GenerationProgress title="Creating your job brief" />}
            {briefError && !briefLoading && (
              <p className="text-center text-sm text-danger">{briefError}</p>
            )}
            {brief && !briefLoading && (
              <JobBriefCard brief={brief} onChange={setBrief} />
            )}
          </>
        ) : (
          <PanelPlaceholder
            icon={Briefcase}
            message="Your job brief will show up here once we've talked through the details."
          />
        )}
      </div>
    </div>
  );
}
