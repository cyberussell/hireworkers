"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SuggestionChips } from "@/components/home/suggestion-chips";

const PLACEHOLDER_EXAMPLES = [
  "I need a licensed electrician for tomorrow…",
  "Looking for a Bubble.io developer with API experience…",
  "Need a reliable part-time virtual assistant…",
  "Find an experienced carpenter near Quezon City…",
  "Looking for a Shopify customer support specialist…",
];

export function HeroPrompt() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (value) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [value]);

  function goToAssistant(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    router.push(`/hire?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    goToAssistant(value);
  }

  function handleChipSelect(label: string) {
    setValue(`I need a ${label}`);
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-3 shadow-sm"
      >
        <label htmlFor="hiring-prompt" className="sr-only">
          Describe the role you&apos;re hiring for
        </label>
        <Textarea
          id="hiring-prompt"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              goToAssistant(value);
            }
          }}
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
          rows={3}
          className="resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0 md:text-lg"
        />
        <div className="flex items-center justify-end px-1 pb-1">
          <Button type="submit" disabled={!value.trim()}>
            Start Hiring
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </motion.form>

      <div className="flex flex-col items-center gap-3">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          Or start from a common role
        </motion.p>
        <SuggestionChips onSelect={handleChipSelect} />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-sm text-muted-foreground"
      >
        Looking for work instead?{" "}
        <Link href="/work" className="text-primary underline underline-offset-2">
          Build your profile with AI
        </Link>
      </motion.p>
    </div>
  );
}
