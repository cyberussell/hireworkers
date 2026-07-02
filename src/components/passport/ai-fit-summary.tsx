"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { readStoredJobBrief } from "@/lib/session-brief";

export function AiFitSummary({ candidateId }: { candidateId: string }) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; summary: string }
    | { status: "unavailable" }
  >({ status: "idle" });

  useEffect(() => {
    const brief = readStoredJobBrief();
    if (!brief) return;

    let cancelled = false;
    // sessionStorage only exists client-side, so this can't be derived during
    // render without a server/client mismatch — starting the fetch here and
    // flagging "loading" is the correct place for this state transition.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });

    fetch("/api/talent/fit-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, jobBrief: brief }),
    })
      .then(async (response) => {
        if (cancelled) return;
        if (!response.ok) {
          setState({ status: "unavailable" });
          return;
        }
        const data = await response.json();
        setState({ status: "ready", summary: data.summary });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "unavailable" });
      });

    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  if (state.status === "idle" || state.status === "unavailable") return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-accent-subtle p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <Sparkles className="size-3.5" />
        AI fit notes for your role
      </div>
      {state.status === "loading" ? (
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      ) : (
        <p className="text-sm text-foreground/90">{state.summary}</p>
      )}
    </div>
  );
}
