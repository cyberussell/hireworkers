"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { upsertSkillAssessment } from "@/lib/assessment-scoring";
import type { GeneratedChecklist } from "@/lib/ai/assessment-prompt";
import type { Assessments } from "@/types/assessments";

export function AssessmentCardChecklist({
  checklist,
  assessments,
  onSave,
}: {
  checklist: GeneratedChecklist;
  assessments: Assessments;
  onSave: (next: Assessments) => Promise<void>;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const saved = assessments.skillAssessments.find(
    (s) => s.name === checklist.title
  );

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function score() {
    setSaving(true);
    await onSave(
      upsertSkillAssessment(assessments, {
        name: checklist.title,
        score: checked.size,
        maxScore: checklist.items.length,
      })
    );
    setSaving(false);
  }

  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <ListChecks className="size-4 text-primary" />
          {checklist.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {saved && (
          <p className="text-sm">
            Your last result:{" "}
            <span className="font-medium">
              {saved.score}/{saved.maxScore}
            </span>
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Check anything you&apos;re comfortable doing.
        </p>
        <div className="flex flex-col gap-1.5">
          {checklist.items.map((item, index) => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked.has(index)}
                onChange={() => toggle(index)}
                className="size-4 rounded border-border"
              />
              {item}
            </label>
          ))}
        </div>
        <Button size="sm" className="w-fit" onClick={score} disabled={saving}>
          {saving ? "Saving…" : "Score me"}
        </Button>
      </CardContent>
    </Card>
  );
}
