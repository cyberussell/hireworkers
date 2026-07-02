"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/types/chat";

export function ChatThread({
  messages,
  isStreaming,
}: {
  messages: ChatMessage[];
  isStreaming: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <ScrollArea className="h-full w-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const showTypingCursor =
            isLast && message.role === "assistant" && isStreaming;
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-3"
            >
              <div
                className={
                  message.role === "assistant"
                    ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    : "flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground"
                }
                aria-hidden="true"
              >
                {message.role === "assistant" ? (
                  <Sparkles className="size-3.5" />
                ) : (
                  <User className="size-3.5" />
                )}
              </div>
              <div className="flex-1 pt-0.5 text-sm leading-relaxed whitespace-pre-wrap">
                {message.content || (showTypingCursor ? "" : "")}
                {showTypingCursor && (
                  <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-foreground/60 align-middle" />
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
