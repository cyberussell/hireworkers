import { CandidateCard } from "@/components/talent/candidate-card";
import type { Candidate } from "@/types/candidate";

export interface CandidateGridEntry {
  candidate: Candidate;
  matchScore?: number;
  matchReasons?: string[];
}

export function CandidateGrid({ entries }: { entries: CandidateGridEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No candidates match yet. Try a different search.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ candidate, matchScore, matchReasons }) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          matchScore={matchScore}
          matchReasons={matchReasons}
        />
      ))}
    </div>
  );
}
