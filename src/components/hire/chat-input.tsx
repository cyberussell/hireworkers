"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (content: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm"
    >
      <label htmlFor="hire-chat-input" className="sr-only">
        Reply to the AI Hiring Assistant
      </label>
      <Textarea
        id="hire-chat-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
          }
        }}
        placeholder="Type your answer…"
        rows={1}
        disabled={disabled}
        className="max-h-40 min-h-9 resize-none border-0 bg-transparent p-2 text-sm shadow-none focus-visible:ring-0"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !value.trim()}
        aria-label="Send"
      >
        <ArrowUp className="size-4" />
      </Button>
    </form>
  );
}
