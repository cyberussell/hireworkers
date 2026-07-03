"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { useAuth } from "@/contexts/auth-context";
import {
  CANDIDATE_CATEGORY_LABELS,
  type CandidateCategory,
  type Availability,
} from "@/types/candidate";
import type { SeekerProfileDraft } from "@/types/seeker-profile-draft";
import { stashPendingProfileDraft } from "@/lib/pending-post";

const inputClass =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm";
const selectClass = inputClass;

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "immediately", label: "I can start now" },
  { value: "within_2_weeks", label: "Within 2 weeks" },
  { value: "within_month", label: "Within a month" },
  { value: "not_available", label: "Not available right now" },
];

export function ProfileDraftCard({
  draft,
  onChange,
}: {
  draft: SeekerProfileDraft;
  onChange: (draft: SeekerProfileDraft) => void;
}) {
  const { user } = useAuth();
  const [publishStatus, setPublishStatus] = useState<
    "idle" | "publishing" | "published" | "error"
  >("idle");
  const [signInOpen, setSignInOpen] = useState(false);

  function update<K extends keyof SeekerProfileDraft>(
    key: K,
    value: SeekerProfileDraft[K]
  ) {
    onChange({ ...draft, [key]: value });
  }

  async function publish() {
    if (!user) {
      stashPendingProfileDraft(draft);
      setSignInOpen(true);
      return;
    }

    setPublishStatus("publishing");
    try {
      const response = await fetch("/api/seeker-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      if (response.status === 401) {
        stashPendingProfileDraft(draft);
        setSignInOpen(true);
        setPublishStatus("idle");
        return;
      }
      if (!response.ok) {
        setPublishStatus("error");
        return;
      }
      setPublishStatus("published");
    } catch {
      setPublishStatus("error");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="mx-auto w-full max-w-2xl gap-4">
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <UserRound className="size-3.5" />
            Your Profile
          </div>
          <CardTitle>
            <input
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              className={`${inputClass} text-lg font-semibold`}
              aria-label="Your name"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 text-sm">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Phone or email (so employers can reach you)
            </span>
            <input
              value={draft.contactDetails}
              onChange={(event) => update("contactDetails", event.target.value)}
              className={inputClass}
              aria-label="Phone or email"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                What kind of work
              </span>
              <input
                value={draft.professionalTitle}
                onChange={(event) =>
                  update("professionalTitle", event.target.value)
                }
                className={inputClass}
                aria-label="What kind of work you do"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Category
              </span>
              <select
                value={draft.category}
                onChange={(event) =>
                  update("category", event.target.value as CandidateCategory)
                }
                className={selectClass}
              >
                {Object.entries(CANDIDATE_CATEGORY_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              About you
            </span>
            <Textarea
              value={draft.professionalSummary}
              onChange={(event) =>
                update("professionalSummary", event.target.value)
              }
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                City
              </span>
              <input
                value={draft.location}
                onChange={(event) => update("location", event.target.value)}
                className={inputClass}
                aria-label="City"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Years doing this work
              </span>
              <input
                type="number"
                min={0}
                value={draft.yearsExperience}
                onChange={(event) =>
                  update("yearsExperience", Number(event.target.value))
                }
                className={inputClass}
                aria-label="Years of experience"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Skills (one per line)
            </span>
            <Textarea
              value={draft.skills.join("\n")}
              onChange={(event) =>
                update("skills", linesToArray(event.target.value))
              }
              rows={Math.max(3, draft.skills.length)}
              className="text-sm"
            />
            <div className="flex flex-wrap gap-1.5">
              {draft.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                When can you start
              </span>
              <select
                value={draft.availability}
                onChange={(event) =>
                  update("availability", event.target.value as Availability)
                }
                className={selectClass}
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Schedule
              </span>
              <select
                value={draft.hoursPerWeek}
                onChange={(event) =>
                  update(
                    "hoursPerWeek",
                    event.target.value as SeekerProfileDraft["hoursPerWeek"]
                  )
                }
                className={selectClass}
              >
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="flexible">Flexible / any schedule</option>
              </select>
            </div>
          </div>

          {publishStatus === "published" ? (
            <Button disabled variant="outline" className="w-full sm:w-fit">
              <Check className="size-4" />
              Profile published
            </Button>
          ) : (
            <Button
              onClick={publish}
              className="w-full sm:w-fit"
              disabled={
                publishStatus === "publishing" || !draft.contactDetails.trim()
              }
            >
              <Sparkles className="size-4" />
              {publishStatus === "publishing"
                ? "Publishing…"
                : "Publish my profile"}
            </Button>
          )}
          {publishStatus === "published" && (
            <p className="text-xs text-muted-foreground">
              Live — visible to any employer browsing{" "}
              <Link href="/talent" className="text-primary underline underline-offset-2">
                Find Talent
              </Link>
              . Head to{" "}
              <Link
                href="/work/dashboard"
                className="text-primary underline underline-offset-2"
              >
                your dashboard
              </Link>{" "}
              to take a quick skills assessment.
            </p>
          )}
          {publishStatus === "error" && (
            <p className="text-xs text-danger">
              Could not publish your profile. Check your connection and try
              again.
            </p>
          )}
          {!user && publishStatus === "idle" && (
            <p className="text-xs text-muted-foreground">
              You&apos;ll be asked to sign in with Google or Facebook before
              this goes live.
            </p>
          )}
        </CardContent>
      </Card>
      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        next="/work"
        title="Sign in to publish your profile"
        description="Sign in with Google or Facebook to publish it — we'll bring you right back."
      />
    </motion.div>
  );
}
