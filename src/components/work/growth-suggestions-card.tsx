import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GrowthSuggestions } from "@/lib/ai/growth-prompt";

// Purely presentational — the suggestions come from a trade_catalog DB
// lookup made once by the parent (see /api/seeker-candidates/me), not
// generated live here. Renders nothing if this candidate's trade hasn't
// been matched to a catalog entry yet.
export function GrowthSuggestionsCard({
  growth,
}: {
  growth: GrowthSuggestions | null;
}) {
  if (!growth) return null;

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap className="size-4 text-primary" />
          Learn &amp; Grow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {growth.suggestions.map((suggestion) => (
            <li key={suggestion.skill} className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{suggestion.skill}</span>
              <span className="text-sm text-muted-foreground">
                {suggestion.reason}
              </span>
              <span className="text-xs text-primary">
                Where to learn: {suggestion.whereToLearn}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
