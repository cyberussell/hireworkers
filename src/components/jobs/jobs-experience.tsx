"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { JobGrid, type JobGridEntry } from "@/components/jobs/job-grid";
import { SearchBar } from "@/components/shared/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostedJob } from "@/types/posted-job";

type MatchStatus = "idle" | "loading" | "error";

function defaultEntries(jobs: PostedJob[]): JobGridEntry[] {
  return [...jobs]
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .map((job) => ({ job }));
}

async function fetchPostedJobs(): Promise<PostedJob[]> {
  try {
    const response = await fetch("/api/posted-jobs");
    if (!response.ok) return [];
    const data: { jobs: PostedJob[] } = await response.json();
    return data.jobs;
  } catch {
    return [];
  }
}

export function JobsExperience() {
  const [hasJobs, setHasJobs] = useState(false);
  const [entries, setEntries] = useState<JobGridEntry[]>([]);
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [degraded, setDegraded] = useState(false);
  const [contextLabel, setContextLabel] = useState<string | null>(null);

  useEffect(() => {
    void fetchPostedJobs().then((jobs) => {
      setHasJobs(jobs.length > 0);
      setEntries(defaultEntries(jobs));
    });
  }, []);

  async function handleSearch(query: string) {
    setStatus("loading");
    setContextLabel(`Results for "${query}"`);
    try {
      const response = await fetch("/api/match-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      const data: { results: JobGridEntry[]; degraded?: boolean } =
        await response.json();

      setEntries(data.results);
      setDegraded(Boolean(data.degraded));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function handleClear() {
    void fetchPostedJobs().then((jobs) => {
      setHasJobs(jobs.length > 0);
      setEntries(defaultEntries(jobs));
    });
    setStatus("idle");
    setDegraded(false);
    setContextLabel(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <SearchBar
        placeholder="Describe the work you want — e.g. 'part-time bookkeeping, remote'"
        onSearch={handleSearch}
        onClear={handleClear}
        disabled={status === "loading" || !hasJobs}
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
          Couldn&apos;t load matches. Showing all jobs instead.
        </p>
      )}

      {status === "loading" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <JobGrid entries={entries} />
      )}
    </div>
  );
}
