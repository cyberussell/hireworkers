"use client";

import { motion } from "framer-motion";

export const HIRING_SUGGESTIONS = [
  "Electrician",
  "Developer",
  "Virtual Assistant",
  "Carpenter",
  "Designer",
  "Caregiver",
  "Customer Support",
  "Driver",
] as const;

export function SuggestionChips({
  onSelect,
}: {
  onSelect: (label: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {HIRING_SUGGESTIONS.map((label, index) => (
        <motion.button
          key={label}
          type="button"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + index * 0.04, duration: 0.35 }}
          onClick={() => onSelect(label)}
          className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent-subtle hover:bg-accent-subtle hover:text-foreground"
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}
