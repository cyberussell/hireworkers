import { Clock, MapPinned, Sparkles, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate, formatSalaryRange } from "@/lib/candidate-format";
import type { PostedJob } from "@/types/posted-job";

const WORK_SETUP_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
};

const SCHEDULE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  flexible: "Flexible",
};

export function JobCard({
  job,
  matchScore,
  matchReasons,
}: {
  job: PostedJob;
  matchScore?: number;
  matchReasons?: string[];
}) {
  const { brief } = job;
  const visibleSkills = brief.requiredSkills.slice(0, 4);
  const extraSkillCount = brief.requiredSkills.length - visibleSkills.length;

  return (
    <Card className="h-full gap-3">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{brief.title}</span>
            <span className="text-xs text-muted-foreground">
              {brief.summary}
            </span>
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
            <MapPinned className="size-3" />
            {WORK_SETUP_LABELS[brief.workSetup] ?? brief.workSetup}
          </span>
          <span className="flex items-center gap-1">
            <Wallet className="size-3" />
            {formatSalaryRange(
              brief.suggestedSalary.min,
              brief.suggestedSalary.max,
              brief.suggestedSalary.period
            )}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatRelativeDate(job.postedAt.slice(0, 10))}
          </span>
        </div>

        <div className="border-t border-border/60 pt-3 text-xs font-medium text-trust">
          {SCHEDULE_LABELS[brief.scheduleType] ?? brief.scheduleType}
        </div>
      </CardContent>
    </Card>
  );
}
