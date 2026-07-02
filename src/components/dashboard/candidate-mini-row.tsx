import Link from "next/link";
import { AvatarGradient } from "@/components/shared/avatar-gradient";
import type { Candidate } from "@/types/candidate";

export function CandidateMiniRow({
  candidate,
  meta,
}: {
  candidate: Candidate;
  meta: string;
}) {
  return (
    <Link
      href={`/talent/${candidate.id}`}
      className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted"
    >
      <AvatarGradient seed={candidate.avatarSeed} name={candidate.name} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{candidate.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {candidate.professionalTitle}
        </span>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>
    </Link>
  );
}
