import Link from "next/link";
import { Clock, Gauge, MapPin, Sparkles, UserRound } from "lucide-react";
import { AvatarGradient } from "@/components/shared/avatar-gradient";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AVAILABILITY_LABELS,
  formatRelativeDate,
} from "@/lib/candidate-format";
import { CANDIDATE_CATEGORY_LABELS, type Candidate } from "@/types/candidate";

export function CandidateCard({
  candidate,
  matchScore,
  matchReasons,
}: {
  candidate: Candidate;
  matchScore?: number;
  matchReasons?: string[];
}) {
  const visibleSkills = candidate.skills.slice(0, 4);
  const extraSkillCount = candidate.skills.length - visibleSkills.length;

  return (
    <Link href={`/talent/${candidate.id}`} className="block">
      <Card className="h-full gap-3 transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AvatarGradient
                seed={candidate.avatarSeed}
                name={candidate.name}
                size="lg"
              />
              <div className="flex flex-col gap-0.5 pt-0.5">
                <span className="text-sm font-semibold">{candidate.name}</span>
                <span className="text-xs text-muted-foreground">
                  {candidate.professionalTitle}
                </span>
                <span className="text-xs text-muted-foreground">
                  {CANDIDATE_CATEGORY_LABELS[candidate.category]} ·{" "}
                  {candidate.yearsExperience}y exp
                </span>
              </div>
            </div>
            {typeof matchScore === "number" && (
              <span className="shrink-0 rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-semibold text-primary">
                {matchScore}% match
              </span>
            )}
          </div>

          {matchReasons && matchReasons.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-lg bg-accent-subtle/60 p-2.5 text-xs text-foreground/80">
              {matchReasons.slice(0, 2).map((reason) => (
                <li key={reason} className="flex gap-1.5">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                  {reason}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[11px]">
                {skill}
              </Badge>
            ))}
            {extraSkillCount > 0 && (
              <Badge variant="outline" className="text-[11px]">
                +{extraSkillCount} more
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {candidate.location.split(",")[0]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatRelativeDate(candidate.lastActive)}
            </span>
            {candidate.assessments.typingSpeedWpm && (
              <span className="flex items-center gap-1">
                <Gauge className="size-3" />
                {candidate.assessments.typingSpeedWpm} WPM
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
            {candidate.selfSubmitted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-primary">
                <UserRound className="size-3" />
                New profile
              </span>
            ) : (
              <VerificationBadge verified={candidate.verified} />
            )}
            <span className="text-xs font-medium text-trust">
              {AVAILABILITY_LABELS[candidate.availability]}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
