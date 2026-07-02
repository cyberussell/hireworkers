import { Award, Gauge, MessageCircle, Quote } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Candidate } from "@/types/candidate";

function ScoreRow({
  icon,
  label,
  value,
  max = 100,
  suffix = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-foreground/80">
          {icon}
          {label}
        </span>
        <span className="font-medium">
          {value}
          {suffix}
        </span>
      </div>
      <Progress value={(value / max) * 100} />
    </div>
  );
}

export function AssessmentsSection({ candidate }: { candidate: Candidate }) {
  const { assessments } = candidate;
  const hasScores =
    assessments.typingSpeedWpm ||
    assessments.communicationScore ||
    assessments.skillAssessments.length > 0;

  return (
    <section className="flex flex-col gap-6">
      {hasScores && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Assessments
          </h2>
          <div className="flex flex-col gap-4">
            {assessments.typingSpeedWpm && (
              <ScoreRow
                icon={<Gauge className="size-3.5" />}
                label="Typing speed"
                value={assessments.typingSpeedWpm}
                max={120}
                suffix=" WPM"
              />
            )}
            {assessments.communicationScore && (
              <ScoreRow
                icon={<MessageCircle className="size-3.5" />}
                label="Communication score"
                value={assessments.communicationScore}
              />
            )}
            {assessments.skillAssessments.map((assessment) => (
              <ScoreRow
                key={assessment.name}
                icon={<Award className="size-3.5" />}
                label={assessment.name}
                value={assessment.score}
                max={assessment.maxScore}
              />
            ))}
          </div>
        </div>
      )}

      {candidate.certifications.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Certifications
          </h2>
          <ul className="flex flex-col gap-2">
            {candidate.certifications.map((cert) => (
              <li
                key={cert.name}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <span>{cert.name}</span>
                <span className="text-xs text-muted-foreground">
                  {cert.issuer} · {cert.year}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {candidate.references.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            References
          </h2>
          <div className="flex flex-col gap-3">
            {candidate.references.map((reference) => (
              <div
                key={reference.name}
                className="rounded-xl border border-border bg-card p-4"
              >
                <Quote className="mb-2 size-4 text-muted-foreground" />
                <p className="text-sm text-foreground/90">
                  &ldquo;{reference.quote}&rdquo;
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {reference.name} — {reference.role} ({reference.relationship})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
