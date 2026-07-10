"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GrowthSuggestions } from "@/lib/ai/growth-prompt";

type GrowthState = "loading" | "unavailable" | "error" | "ready";

export function GrowthSuggestionsCard() {
  const [status, setStatus] = useState<GrowthState>("loading");
  const [data, setData] = useState<GrowthSuggestions | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/seeker-candidates/me/growth")
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 503) {
          setStatus("unavailable");
          return;
        }
        if (!response.ok) {
          setStatus("error");
          return;
        }
        const result = await response.json();
        setData(result);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading" || status === "unavailable" || status === "error") {
    return null;
  }

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap className="size-4 text-primary" />
          Learn &amp; Grow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {data?.suggestions.map((suggestion) => (
            <li key={suggestion.skill} className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{suggestion.skill}</span>
              <span className="text-sm text-muted-foreground">
                {suggestion.reason}
              </span>
              <span className="text-xs text-primary">
                Where to learn: {suggestion.whereToLearn}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
