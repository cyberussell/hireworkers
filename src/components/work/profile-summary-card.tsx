"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, MapPin, Pencil, Sparkles, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CANDIDATE_CATEGORY_LABELS } from "@/types/candidate";
import type { Candidate } from "@/types/candidate";
import { publishSavedProfile } from "@/lib/publish-profile";

const AVAILABILITY_LABELS: Record<Candidate["availability"], string> = {
  immediately: "Can start now",
  within_2_weeks: "Available within 2 weeks",
  within_month: "Available within a month",
  not_available: "Not available right now",
};

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function rateLabel(candidate: Candidate) {
  if (candidate.rateType === "daily" && candidate.dailyRate) {
    const hourly = Math.round((candidate.dailyRate / 8) * 100) / 100;
    return `₱${candidate.dailyRate.toLocaleString()}/day (≈ ₱${hourly.toLocaleString()}/hour)`;
  }
  if (candidate.rateType === "contract") return "Per contract/project";
  return "Not specified yet";
}

export function ProfileSummaryCard({
  candidate,
  onEdit,
  onPublished,
}: {
  candidate: Candidate;
  onEdit: () => void;
  onPublished?: (candidate: Candidate) => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    const result = await publishSavedProfile();
    setPublishing(false);
    if (!result.ok) {
      setPublishError(
        result.reason ?? "Could not publish your profile. Try again."
      );
      return;
    }
    onPublished?.(result.candidate);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="mx-auto w-full max-w-2xl gap-4">
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <UserRound className="size-4" />
            Your Profile
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                {candidate.avatarUrl && (
                  <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                )}
                <AvatarFallback className="text-base">
                  {initialsFor(candidate.name) || <UserRound className="size-5" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl font-semibold">
                  {candidate.name}
                </CardTitle>
                <p className="text-base text-muted-foreground">
                  {candidate.professionalTitle}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 text-base">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {CANDIDATE_CATEGORY_LABELS[candidate.category]}
            </Badge>
            <Badge variant="secondary">
              {AVAILABILITY_LABELS[candidate.availability]}
            </Badge>
            {candidate.location && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {candidate.location}
              </span>
            )}
          </div>

          <p className="leading-relaxed text-foreground/90">
            {candidate.professionalSummary}
          </p>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">
              Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-muted-foreground">
                Years doing this work
              </span>
              <span>{candidate.yearsExperience}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-muted-foreground">
                Rate
              </span>
              <span>{rateLabel(candidate)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-muted-foreground">
                Reach them at
              </span>
              <span>{candidate.contactDetails ?? "—"}</span>
            </div>
          </div>

          {candidate.published ? (
            <p className="text-sm text-muted-foreground">
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
              to see how many people have viewed it.
            </p>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Lock className="size-3.5" />
                Saved privately — only you can see this until you publish it.
              </p>
              <Button
                onClick={() => void handlePublish()}
                disabled={publishing}
                className="w-full sm:w-fit"
              >
                <Sparkles className="size-4" />
                {publishing ? "Publishing…" : "Publish my profile"}
              </Button>
              {publishError && (
                <p className="text-sm text-danger">{publishError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
