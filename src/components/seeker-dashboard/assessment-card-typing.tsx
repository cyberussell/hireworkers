"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TYPING_ASSESSMENT } from "@/lib/assessments-catalog";
import type { Assessments } from "@/types/assessments";

function countCorrectChars(passage: string, typed: string) {
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === passage[i]) correct++;
  }
  return correct;
}

export function AssessmentCardTyping({
  assessments,
  onSave,
}: {
  assessments: Assessments;
  onSave: (next: Assessments) => Promise<void>;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "saving" | "done">(
    "idle"
  );
  const [typed, setTyped] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TYPING_ASSESSMENT.durationSeconds);
  const typedRef = useRef("");

  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function start() {
    setTyped("");
    typedRef.current = "";
    setSecondsLeft(TYPING_ASSESSMENT.durationSeconds);
    setStatus("running");
  }

  function handleChange(value: string) {
    typedRef.current = value;
    setTyped(value);
  }

  async function finish() {
    const elapsedMinutes = TYPING_ASSESSMENT.durationSeconds / 60;
    const correctChars = countCorrectChars(TYPING_ASSESSMENT.passage, typedRef.current);
    const wpm = Math.round(correctChars / 5 / elapsedMinutes);

    setStatus("saving");
    await onSave({ ...assessments, typingSpeedWpm: wpm });
    setStatus("done");
  }

  const savedWpm = assessments.typingSpeedWpm;

  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Gauge className="size-4 text-trust" />
          {TYPING_ASSESSMENT.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {savedWpm !== undefined && status === "idle" && (
          <p className="text-sm">
            Your last result: <span className="font-medium">{savedWpm} WPM</span>
          </p>
        )}

        {status === "idle" && (
          <Button size="sm" onClick={start} className="w-fit">
            {savedWpm !== undefined ? "Retake" : "Start"} ({TYPING_ASSESSMENT.durationSeconds}s)
          </Button>
        )}

        {status === "running" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Type the passage below — {secondsLeft}s left
            </p>
            <p className="rounded-md border border-border bg-muted/40 p-2 text-sm leading-relaxed">
              {TYPING_ASSESSMENT.passage.split("").map((char, i) => (
                <span
                  key={i}
                  className={
                    i < typed.length
                      ? typed[i] === char
                        ? "text-trust"
                        : "text-danger underline"
                      : "text-muted-foreground"
                  }
                >
                  {char}
                </span>
              ))}
            </p>
            <textarea
              autoFocus
              value={typed}
              onChange={(event) => handleChange(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              rows={3}
            />
          </div>
        )}

        {status === "saving" && (
          <p className="text-sm text-muted-foreground">Saving your result…</p>
        )}

        {status === "done" && (
          <p className="text-sm">
            Done — <span className="font-medium">{assessments.typingSpeedWpm} WPM</span>.{" "}
            <button
              type="button"
              onClick={start}
              className="text-primary underline underline-offset-2"
            >
              Retake
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
