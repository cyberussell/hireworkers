import { ExternalLink, FolderOpen } from "lucide-react";
import type { Candidate } from "@/types/candidate";

export function PortfolioSection({ candidate }: { candidate: Candidate }) {
  if (candidate.portfolio.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Portfolio
      </h2>
      <div className="flex flex-col gap-3">
        {candidate.portfolio.map((item) => (
          <div
            key={item.title}
            className="flex gap-3 rounded-xl border border-border bg-card p-4"
          >
            <FolderOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.title}</span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                    aria-label={`Open ${item.title}`}
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
