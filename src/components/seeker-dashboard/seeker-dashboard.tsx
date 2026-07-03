"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { Button } from "@/components/ui/button";
import { PanelPlaceholder } from "@/components/shared/panel-placeholder";
import { AiUnavailableBanner } from "@/components/hire/ai-unavailable-banner";
import { TYPING_RELEVANT_CATEGORIES } from "@/lib/assessments-catalog";
import { AssessmentCardTyping } from "@/components/seeker-dashboard/assessment-card-typing";
import { AssessmentCardChecklist } from "@/components/seeker-dashboard/assessment-card-checklist";
import { AssessmentCardScenario } from "@/components/seeker-dashboard/assessment-card-scenario";
import type { AssessmentGenerationResult } from "@/lib/ai/assessment-prompt";
import type { Candidate } from "@/types/candidate";
import type { Assessments } from "@/types/assessments";

export function SeekerDashboard() {
  const { user, loading } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [signInOpen, setSignInOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [generated, setGenerated] = useState<AssessmentGenerationResult | null>(
    null
  );
  const [generationStatus, setGenerationStatus] = useState<
    "idle" | "loading" | "ai_unavailable" | "error"
  >("idle");

  useEffect(() => {
    if (!user) {
      setCandidateLoading(false);
      return;
    }

    let cancelled = false;
    setCandidateLoading(true);
    fetch("/api/seeker-candidates/me")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setCandidate(data.candidate ?? null);
      })
      .catch(() => {
        if (!cancelled) setCandidate(null);
      })
      .finally(() => {
        if (!cancelled) setCandidateLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!candidate) return;

    let cancelled = false;
    setGenerationStatus("loading");
    fetch("/api/assessments/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professionalTitle: candidate.professionalTitle,
        category: candidate.category,
        skills: candidate.skills,
      }),
    })
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 503) {
          setGenerationStatus("ai_unavailable");
          return;
        }
        if (!response.ok) {
          setGenerationStatus("error");
          return;
        }
        const data = await response.json();
        setGenerated(data);
        setGenerationStatus("idle");
      })
      .catch(() => {
        if (!cancelled) setGenerationStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id]);

  async function saveAssessments(next: Assessments) {
    setSaveError(false);
    try {
      const response = await fetch("/api/seeker-candidates/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessments: next }),
      });
      if (!response.ok) {
        setSaveError(true);
        return;
      }
      const data = await response.json();
      setCandidate(data.candidate);
    } catch {
      setSaveError(true);
    }
  }

  if (loading || (user && candidateLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PanelPlaceholder icon={UserRound} message="Loading your dashboard…" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <PanelPlaceholder
          icon={UserRound}
          message="Sign in to see your dashboard and take skill assessments."
        />
        <Button onClick={() => setSignInOpen(true)}>Sign in</Button>
        <SignInDialog
          open={signInOpen}
          onOpenChange={setSignInOpen}
          next="/work/dashboard"
        />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <PanelPlaceholder
          icon={UserRound}
          message="You haven't published a profile yet. Build one to unlock your dashboard and skill assessments."
        />
        <Button nativeButton={false} render={<Link href="/work" />}>
          Build my profile
        </Button>
      </div>
    );
  }

  const showTyping = TYPING_RELEVANT_CATEGORIES.includes(candidate.category);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete these to strengthen your{" "}
          <Link
            href={`/talent/${candidate.id}`}
            className="text-primary underline underline-offset-2"
          >
            public profile
          </Link>
          .
        </p>
      </div>

      {saveError && (
        <p className="text-xs text-danger">
          Could not save that. Check your connection and try again.
        </p>
      )}

      {generationStatus === "loading" && (
        <PanelPlaceholder
          icon={UserRound}
          message={`Building assessments for your work as a ${candidate.professionalTitle}…`}
        />
      )}
      {generationStatus === "ai_unavailable" && <AiUnavailableBanner />}
      {generationStatus === "error" && (
        <p className="text-sm text-danger">
          Could not build your assessments right now. Refresh to try again.
        </p>
      )}

      {generationStatus === "idle" && generated && (
        <div className="grid gap-4 sm:grid-cols-2">
          {showTyping && (
            <AssessmentCardTyping
              assessments={candidate.assessments}
              onSave={saveAssessments}
            />
          )}
          <AssessmentCardChecklist
            checklist={generated.checklist}
            assessments={candidate.assessments}
            onSave={saveAssessments}
          />
          <AssessmentCardScenario
            scenario={generated.scenario}
            assessments={candidate.assessments}
            onSave={saveAssessments}
          />
        </div>
      )}
    </div>
  );
}
