"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type RankingState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "insufficient"; sampleSize: number; categoryLabel: string }
  | { status: "ready"; percentile: number; sampleSize: number; categoryLabel: string };

export function IndustryRankingCard() {
  const [state, setState] = useState<RankingState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/seeker-candidates/me/ranking")
      .then((response) => {
        if (!response.ok) throw new Error("failed");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.sufficientData) {
          setState({
            status: "insufficient",
            sampleSize: data.sampleSize,
            categoryLabel: data.categoryLabel,
          });
        } else {
          setState({
            status: "ready",
            percentile: data.percentile,
            sampleSize: data.sampleSize,
            categoryLabel: data.categoryLabel,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading" || state.status === "error") return null;

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="size-4 text-trust" />
          Industry Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.status === "insufficient" ? (
          <p className="text-sm text-muted-foreground">
            Not enough published {state.categoryLabel} profiles yet to
            compare you against — check back as more people join.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-foreground/90">
              Your profile is stronger than{" "}
              <span className="font-semibold text-trust">
                {state.percentile}%
              </span>{" "}
              of {state.categoryLabel} profiles on HireWorkers.
            </p>
            <Progress value={state.percentile} />
            <p className="text-xs text-muted-foreground">
              Based on {state.sampleSize} other published{" "}
              {state.categoryLabel} profiles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
