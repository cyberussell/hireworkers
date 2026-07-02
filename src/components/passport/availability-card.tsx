import { Calendar, Clock3 } from "lucide-react";
import { AVAILABILITY_LABELS } from "@/lib/candidate-format";
import type { Candidate } from "@/types/candidate";

const HOURS_LABELS: Record<Candidate["hoursPerWeek"], string> = {
  full_time: "Full-time (40h/week)",
  part_time: "Part-time",
  flexible: "Flexible hours",
};

export function AvailabilityCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Availability
      </h2>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="size-4 text-trust" />
        <span className="font-medium text-trust">
          {AVAILABILITY_LABELS[candidate.availability]}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-foreground/80">
        <Clock3 className="size-4 text-muted-foreground" />
        {HOURS_LABELS[candidate.hoursPerWeek]}
      </div>
    </div>
  );
}
