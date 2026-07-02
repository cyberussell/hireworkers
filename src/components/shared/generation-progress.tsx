"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DEFAULT_STAGES = [
  "Analyzing your conversation…",
  "Drafting responsibilities…",
  "Matching required and preferred skills…",
  "Calculating a suggested PHP salary range…",
  "Writing interview questions…",
  "Finalizing job brief…",
];

// There's no real progress signal from the API (generateObject returns once,
// not incrementally), so this simulates a decelerating fill: fast at first,
// slows as it approaches the cap, and never claims 100% until the result
// actually arrives — avoids lying about completion.
export function GenerationProgress({
  title = "Creating your job brief",
  stages = DEFAULT_STAGES,
}: {
  title?: string;
  stages?: string[];
}) {
  const [progress, setProgress] = useState(4);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const remaining = 92 - prev;
        return prev + Math.max(0.5, remaining * 0.08);
      });
    }, 200);

    const stageTimer = setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, stages.length - 1));
    }, 1400);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stageTimer);
    };
  }, [stages.length]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Sparkles className="size-4 animate-pulse" />
        {title}
      </div>
      <Progress value={progress} />
      <p className="text-xs text-muted-foreground">{stages[stageIndex]}</p>
    </div>
  );
}
