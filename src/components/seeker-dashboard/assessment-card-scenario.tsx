"use client";

import { useState } from "react";
import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiUnavailableBanner } from "@/components/hire/ai-unavailable-banner";
import { upsertSkillAssessment } from "@/lib/assessment-scoring";
import type { GeneratedScenario } from "@/lib/ai/assessment-prompt";
import type { Assessments } from "@/types/assessments";

export function AssessmentCardScenario({
  scenario,
  assessments,
  onSave,
}: {
  scenario: GeneratedScenario;
  assessments: Assessments;
  onSave: (next: Assessments) => Promise<void>;
}) {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<
    "idle" | "grading" | "ai_unavailable" | "error"
  >("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const saved = assessments.skillAssessments.find(
    (s) => s.name === scenario.title
  );

  async function submit() {
    if (!response.trim()) return;
    setStatus("grading");
    try {
      const result = await fetch("/api/assessments/scenario-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: scenario.title,
          scenarioPrompt: scenario.prompt,
          response,
        }),
      });
      if (result.status === 503) {
        setStatus("ai_unavailable");
        return;
      }
      if (!result.ok) {
        setStatus("error");
        return;
      }
      const data = await result.json();
      await onSave(
        upsertSkillAssessment(assessments, {
          name: scenario.title,
          score: data.result.score,
          maxScore: data.result.maxScore,
        })
      );
      setFeedback(data.result.feedback);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Award className="size-4 text-warning" />
          {scenario.title}
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
        <p className="text-sm text-foreground/80">{scenario.prompt}</p>
        <Textarea
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          placeholder="Write your response…"
          rows={3}
          disabled={status === "grading"}
        />
        {status === "ai_unavailable" && <AiUnavailableBanner />}
        {status === "error" && (
          <p className="text-xs text-danger">
            Could not grade that. Try again.
          </p>
        )}
        {feedback && status === "idle" && (
          <p className="text-xs text-muted-foreground">{feedback}</p>
        )}
        <Button
          size="sm"
          className="w-fit"
          onClick={submit}
          disabled={status === "grading" || !response.trim()}
        >
          {status === "grading" ? "Grading…" : "Submit for grading"}
        </Button>
      </CardContent>
    </Card>
  );
}
