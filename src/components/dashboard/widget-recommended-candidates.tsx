import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateMiniRow } from "@/components/dashboard/candidate-mini-row";
import { candidates } from "@/lib/candidates";

export function WidgetRecommendedCandidates() {
  const recommended = candidates.filter((c) => c.featured).slice(0, 5);

  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          Recommended Candidates
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {recommended.map((candidate) => (
          <CandidateMiniRow
            key={candidate.id}
            candidate={candidate}
            meta={`${candidate.yearsExperience}y exp`}
          />
        ))}
      </CardContent>
    </Card>
  );
}
