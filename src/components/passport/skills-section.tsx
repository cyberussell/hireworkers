import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Candidate } from "@/types/candidate";

export function SkillsSection({ candidate }: { candidate: Candidate }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Skills &amp; Languages
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.map((skill) => (
          <Badge key={skill} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>
      {candidate.aiSkillsTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.aiSkillsTags.map((tag) => (
            <Badge
              key={tag}
              className="gap-1 border-primary/20 bg-accent-subtle text-primary"
              variant="outline"
            >
              <Sparkles className="size-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {candidate.languages.map((language) => (
          <span key={language.name}>
            {language.name}{" "}
            <span className="text-xs">({language.proficiency})</span>
          </span>
        ))}
      </div>
    </section>
  );
}
