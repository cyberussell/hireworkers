"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Check, Send } from "lucide-react";
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
import type { JobBrief } from "@/types/job-brief";
import { JOB_BRIEF_STORAGE_KEY } from "@/lib/session-brief";
import { stashPendingJobBrief } from "@/lib/pending-post";

const selectClass =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm";
const inputClass =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm";

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function JobBriefCard({
  brief,
  onChange,
}: {
  brief: JobBrief;
  onChange: (brief: JobBrief) => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [postStatus, setPostStatus] = useState<
    "idle" | "posting" | "posted" | "error"
  >("idle");
  const [signInOpen, setSignInOpen] = useState(false);

  function update<K extends keyof JobBrief>(key: K, value: JobBrief[K]) {
    onChange({ ...brief, [key]: value });
  }

  function viewCandidates() {
    sessionStorage.setItem(JOB_BRIEF_STORAGE_KEY, JSON.stringify(brief));
    router.push("/talent");
  }

  async function postJob() {
    if (!user) {
      stashPendingJobBrief(brief);
      setSignInOpen(true);
      return;
    }

    setPostStatus("posting");
    try {
      const response = await fetch("/api/posted-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      if (response.status === 401) {
        stashPendingJobBrief(brief);
        setSignInOpen(true);
        setPostStatus("idle");
        return;
      }
      if (!response.ok) {
        setPostStatus("error");
        return;
      }
      setPostStatus("posted");
    } catch {
      setPostStatus("error");
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
            <Briefcase className="size-3.5" />
            Job Brief
          </div>
          <CardTitle>
            <input
              value={brief.title}
              onChange={(event) => update("title", event.target.value)}
              className={`${inputClass} text-lg font-semibold`}
              aria-label="Job title"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Company name
              </span>
              <input
                value={brief.companyName}
                onChange={(event) => update("companyName", event.target.value)}
                className={inputClass}
                aria-label="Company name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Contact email or phone
              </span>
              <input
                value={brief.contactDetails}
                onChange={(event) =>
                  update("contactDetails", event.target.value)
                }
                className={inputClass}
                aria-label="Contact email or phone"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Summary
            </span>
            <Textarea
              value={brief.summary}
              onChange={(event) => update("summary", event.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Responsibilities
            </span>
            <Textarea
              value={brief.responsibilities.join("\n")}
              onChange={(event) =>
                update("responsibilities", linesToArray(event.target.value))
              }
              rows={Math.max(3, brief.responsibilities.length)}
              className="text-sm"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Required skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {brief.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Preferred skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {brief.preferredSkills.length ? (
                  brief.preferredSkills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Work setup
              </span>
              <select
                value={brief.workSetup}
                onChange={(event) =>
                  update(
                    "workSetup",
                    event.target.value as JobBrief["workSetup"]
                  )
                }
                className={selectClass}
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Schedule
              </span>
              <select
                value={brief.scheduleType}
                onChange={(event) =>
                  update(
                    "scheduleType",
                    event.target.value as JobBrief["scheduleType"]
                  )
                }
                className={selectClass}
              >
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Suggested salary (PHP)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={brief.suggestedSalary.min}
                onChange={(event) =>
                  update("suggestedSalary", {
                    ...brief.suggestedSalary,
                    min: Number(event.target.value),
                  })
                }
                className={inputClass}
                aria-label="Minimum salary"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="number"
                value={brief.suggestedSalary.max}
                onChange={(event) =>
                  update("suggestedSalary", {
                    ...brief.suggestedSalary,
                    max: Number(event.target.value),
                  })
                }
                className={inputClass}
                aria-label="Maximum salary"
              />
              <select
                value={brief.suggestedSalary.period}
                onChange={(event) =>
                  update("suggestedSalary", {
                    ...brief.suggestedSalary,
                    period: event.target
                      .value as JobBrief["suggestedSalary"]["period"],
                  })
                }
                className={`${selectClass} max-w-28`}
              >
                <option value="hour">/hour</option>
                <option value="month">/month</option>
                <option value="project">/project</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Interview questions
            </span>
            <Textarea
              value={brief.interviewQuestions.join("\n")}
              onChange={(event) =>
                update(
                  "interviewQuestions",
                  linesToArray(event.target.value)
                )
              }
              rows={Math.max(3, brief.interviewQuestions.length)}
              className="text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Assessment recommendations
            </span>
            <Textarea
              value={brief.assessmentRecommendations.join("\n")}
              onChange={(event) =>
                update(
                  "assessmentRecommendations",
                  linesToArray(event.target.value)
                )
              }
              rows={Math.max(2, brief.assessmentRecommendations.length)}
              className="text-sm"
            />
          </div>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            {postStatus === "posted" ? (
              <Button disabled variant="outline" className="w-full sm:w-fit">
                <Check className="size-4" />
                Posted
              </Button>
            ) : (
              <Button
                onClick={postJob}
                variant="outline"
                className="w-full sm:w-fit"
                disabled={
                  postStatus === "posting" ||
                  !brief.companyName.trim() ||
                  !brief.contactDetails.trim()
                }
              >
                <Send className="size-4" />
                {postStatus === "posting" ? "Posting…" : "Post job"}
              </Button>
            )}
            <Button onClick={viewCandidates} className="w-full sm:w-fit">
              See matching candidates
              <ArrowRight className="size-4" />
            </Button>
          </div>
          {postStatus === "posted" && (
            <p className="text-xs text-muted-foreground">
              Live — visible to anyone browsing{" "}
              <Link href="/jobs" className="text-primary underline underline-offset-2">
                Find Work
              </Link>{" "}
              and on your{" "}
              <Link href="/dashboard" className="text-primary underline underline-offset-2">
                dashboard
              </Link>
              .
            </p>
          )}
          {postStatus === "error" && (
            <p className="text-xs text-danger">
              Could not post the job. Check your connection and try again.
            </p>
          )}
          {!user && postStatus === "idle" && (
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
        next="/hire"
        title="Sign in to post this job"
        description="Sign in with Google or Facebook to publish it — we'll bring you right back."
      />
    </motion.div>
  );
}
