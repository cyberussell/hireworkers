import { Clock, MapPin, Zap } from "lucide-react";
import { AvatarGradient } from "@/components/shared/avatar-gradient";
import { VerificationBadge } from "@/components/shared/verification-badge";
import {
  AVAILABILITY_LABELS,
  formatRelativeDate,
} from "@/lib/candidate-format";
import { CANDIDATE_CATEGORY_LABELS, type Candidate } from "@/types/candidate";

export function PassportHeader({ candidate }: { candidate: Candidate }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <AvatarGradient
        seed={candidate.avatarSeed}
        name={candidate.name}
        size="xl"
      />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {candidate.name}
          </h1>
          <VerificationBadge verified={candidate.verified} />
        </div>
        <p className="text-base text-muted-foreground">
          {candidate.professionalTitle} ·{" "}
          {CANDIDATE_CATEGORY_LABELS[candidate.category]}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {candidate.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatRelativeDate(candidate.lastActive)}
          </span>
          <span className="flex items-center gap-1 font-medium text-trust">
            <Zap className="size-3.5" />
            {AVAILABILITY_LABELS[candidate.availability]}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 gap-4 rounded-xl border border-border bg-card px-4 py-3 sm:flex-col sm:gap-1">
        {candidate.selfSubmitted ? (
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-primary">New</span>
            <span className="text-xs text-muted-foreground">
              No activity yet
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">
                {candidate.responseRate}%
              </span>
              <span className="text-xs text-muted-foreground">
                Response rate
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">
                {candidate.responseTimeHours}h
              </span>
              <span className="text-xs text-muted-foreground">
                Avg response
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
