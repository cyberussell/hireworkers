"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, formatSalaryRange } from "@/lib/candidate-format";
import type { PostedJob } from "@/types/posted-job";

export function WidgetActiveHiring() {
  const [jobs, setJobs] = useState<PostedJob[] | null>(null);

  useEffect(() => {
    fetch("/api/posted-jobs")
      .then((response) => (response.ok ? response.json() : { jobs: [] }))
      .then((data: { jobs: PostedJob[] }) => setJobs(data.jobs))
      .catch(() => setJobs([]));
  }, []);

  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4 text-muted-foreground" />
          Active Hiring
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3">
        {!jobs ? null : jobs.length === 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              No active hiring yet — start with the AI Hiring Assistant to
              build your first job brief.
            </p>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/hire" />}
            >
              Start with AI Hiring Assistant
            </Button>
          </>
        ) : (
          <ul className="flex w-full flex-col gap-1">
            {jobs.slice(0, 5).map((job) => (
              <li key={job.id}>
                <Link
                  href="/talent"
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {job.brief.title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {formatSalaryRange(
                        job.brief.suggestedSalary.min,
                        job.brief.suggestedSalary.max,
                        job.brief.suggestedSalary.period
                      )}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeDate(job.postedAt.slice(0, 10))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
