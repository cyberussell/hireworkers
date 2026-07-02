import { JobCard } from "@/components/jobs/job-card";
import type { PostedJob } from "@/types/posted-job";

export interface JobGridEntry {
  job: PostedJob;
  matchScore?: number;
  matchReasons?: string[];
}

export function JobGrid({ entries }: { entries: JobGridEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No jobs posted yet on this device. Check back after an employer
        posts one from the AI Hiring Assistant.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ job, matchScore, matchReasons }) => (
        <JobCard
          key={job.id}
          job={job}
          matchScore={matchScore}
          matchReasons={matchReasons}
        />
      ))}
    </div>
  );
}
