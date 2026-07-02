import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateMiniRow } from "@/components/dashboard/candidate-mini-row";
import { candidates } from "@/lib/candidates";

export function WidgetReadyToday() {
  const readyNow = candidates
    .filter((c) => c.availability === "immediately")
    .slice(0, 5);

  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Zap className="size-4 text-trust" />
          Candidates Ready Today
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {readyNow.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No one is immediately available right now.
          </p>
        ) : (
          readyNow.map((candidate) => (
            <CandidateMiniRow
              key={candidate.id}
              candidate={candidate}
              meta={`${candidate.responseRate}% response`}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
