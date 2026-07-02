import type { Candidate } from "@/types/candidate";

export function WorkHistorySection({ candidate }: { candidate: Candidate }) {
  if (candidate.workHistory.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Work History
      </h2>
      <ol className="flex flex-col gap-5 border-l border-border pl-4">
        {candidate.workHistory.map((entry) => (
          <li key={`${entry.role}-${entry.client}`} className="relative">
            <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-primary" />
            <p className="text-sm font-medium">{entry.role}</p>
            <p className="text-xs text-muted-foreground">
              {entry.client} · {entry.duration}
            </p>
            <p className="mt-1 text-sm text-foreground/80">
              {entry.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
