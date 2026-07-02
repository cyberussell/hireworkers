"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CandidateGrid, type CandidateGridEntry } from "@/components/talent/candidate-grid";
import { SearchBar } from "@/components/shared/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { candidates } from "@/lib/candidates";
import { readStoredJobBrief } from "@/lib/session-brief";
import type { Candidate } from "@/types/candidate";
import type { JobBrief } from "@/types/job-brief";

type MatchStatus = "idle" | "loading" | "error";

function sortDefault(list: Candidate[]): Candidate[] {
  return [...list].sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) {
      return Number(b.featured) - Number(a.featured);
    }
    return b.lastActive.localeCompare(a.lastActive);
  });
}

function defaultEntries(): CandidateGridEntry[] {
  return sortDefault(candidates).map((candidate) => ({ candidate }));
}

async function fetchSubmittedCandidates(): Promise<Candidate[]> {
  try {
    const response = await fetch("/api/seeker-candidates");
    if (!response.ok) return [];
    const data: { candidates: Candidate[] } = await response.json();
    return data.candidates;
  } catch {
    return [];
  }
}

export function TalentExperience() {
  const [entries, setEntries] = useState<CandidateGridEntry[]>(defaultEntries);
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [degraded, setDegraded] = useState(false);
  const [contextLabel, setContextLabel] = useState<string | null>(null);

  async function runMatch(
    body: { mode: "brief"; jobBrief: JobBrief } | { mode: "query"; query: string },
    label: string
  ) {
    setStatus("loading");
    setContextLabel(label);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      const data: {
        results: CandidateGridEntry[];
        degraded?: boolean;
      } = await response.json();

      setEntries(data.results);
      setDegraded(Boolean(data.degraded));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function loadDefaultWithSubmitted() {
    const submitted = await fetchSubmittedCandidates();
    setEntries([
      ...submitted.map((candidate) => ({ candidate })),
      ...defaultEntries(),
    ]);
  }

  useEffect(() => {
    const brief = readStoredJobBrief();
    if (brief) {
      // sessionStorage is client-only, so this can't be read during render —
      // runMatch's internal setStatus("loading") is a legitimate state
      // transition kicked off by this client-only effect, not a cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void runMatch({ mode: "brief", jobBrief: brief }, `Matched to "${brief.title}"`);
    } else {
      void loadDefaultWithSubmitted();
    }
  }, []);

  function handleSearch(query: string) {
    void runMatch({ mode: "query", query }, `Results for "${query}"`);
  }

  function handleClear() {
    void loadDefaultWithSubmitted();
    setStatus("idle");
    setDegraded(false);
    setContextLabel(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <SearchBar
        placeholder="Describe who you need — e.g. 'customer support with Zendesk experience'"
        onSearch={handleSearch}
        onClear={handleClear}
        disabled={status === "loading"}
      />

      {contextLabel && status !== "loading" && (
        <p className="text-sm text-muted-foreground">{contextLabel}</p>
      )}

      {degraded && status !== "loading" && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-subtle px-3 py-2 text-xs text-warning">
          <AlertTriangle className="size-3.5 shrink-0" />
          Showing keyword matches — AI ranking is unavailable right now.
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-danger">
          Couldn&apos;t load matches. Showing all candidates instead.
        </p>
      )}

      {status === "loading" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <CandidateGrid entries={entries} />
      )}
    </div>
  );
}
