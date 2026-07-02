import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateMiniRow } from "@/components/dashboard/candidate-mini-row";
import { candidates } from "@/lib/candidates";
import { formatRelativeDate } from "@/lib/candidate-format";

export function WidgetRecentlyActive() {
  const recent = [...candidates]
    .sort((a, b) => b.lastActive.localeCompare(a.lastActive))
    .slice(0, 5);

  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="size-4 text-muted-foreground" />
          Recently Active Talent
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {recent.map((candidate) => (
          <CandidateMiniRow
            key={candidate.id}
            candidate={candidate}
            meta={formatRelativeDate(candidate.lastActive)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
