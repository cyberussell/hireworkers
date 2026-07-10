"use client";

import { useState } from "react";
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
import { AvatarUpload } from "@/components/work/avatar-upload";
import { useAuth } from "@/contexts/auth-context";
import {
  CANDIDATE_CATEGORY_LABELS,
  type CandidateCategory,
  type Availability,
  type Candidate,
} from "@/types/candidate";
import {
  PaymentMethodsField,
  GovernmentIdFields,
  RateField,
} from "@/components/work/profile-payment-identity-fields";
import type { SeekerProfileDraft } from "@/types/seeker-profile-draft";
import { stashPendingProfileDraft } from "@/lib/pending-post";
import {
  publishProfileDraft,
  updateProfileDraft,
  type PublishProfileResult,
} from "@/lib/publish-profile";
import {
  isValidContactDetails,
  isValidName,
  validateProfileDraftFields,
} from "@/lib/validate-profile-draft";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-base";
const selectClass = inputClass;
const labelClass = "text-sm font-medium text-muted-foreground";

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

function AvailabilityFields({
  draft,
  onChange,
}: {
  draft: SeekerProfileDraft;
  onChange: (draft: SeekerProfileDraft) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>When can you start</span>
        <select
          value={draft.availability}
          onChange={(event) =>
            onChange({
              ...draft,
              availability: event.target.value as Availability,
            })
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
        <span className={labelClass}>Schedule</span>
        <select
          value={draft.hoursPerWeek}
          onChange={(event) =>
            onChange({
              ...draft,
              hoursPerWeek:
                event.target.value as SeekerProfileDraft["hoursPerWeek"],
            })
          }
          className={selectClass}
        >
          <option value="full_time">Full-time</option>
          <option value="part_time">Part-time</option>
          <option value="flexible">Flexible / any schedule</option>
        </select>
      </div>
    </div>
  );
}

export function ProfileAvailabilityPanel({
  draft,
  onChange,
}: {
  draft: SeekerProfileDraft;
  onChange: (draft: SeekerProfileDraft) => void;
}) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-base">
        <AvailabilityFields draft={draft} onChange={onChange} />
      </CardContent>
    </Card>
  );
}

export function ProfileDraftCard({
  draft,
  onChange,
  variant = "create",
  onSaved,
  avatarUrl,
  onAvatarChanged,
}: {
  draft: SeekerProfileDraft;
  onChange: (draft: SeekerProfileDraft) => void;
  /** "create" publishes a new profile (POST); "edit" saves changes to an
   * already-published one (PATCH) without touching portfolio, verification,
   * or assessments. */
  variant?: "create" | "edit";
  onSaved?: (candidate: Candidate) => void;
  /** Only meaningful in "edit" mode — there's no row to attach a custom
   * photo to until the profile is first saved. */
  avatarUrl?: string;
  onAvatarChanged?: (avatarUrl: string) => void;
}) {
  const { user } = useAuth();
  const [publishStatus, setPublishStatus] = useState<
    "idle" | "publishing" | "published" | "error"
  >("idle");
  const [signInOpen, setSignInOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fieldErrors = validateProfileDraftFields(draft);
  const isEdit = variant === "edit";

  function update<K extends keyof SeekerProfileDraft>(
    key: K,
    value: SeekerProfileDraft[K]
  ) {
    onChange({ ...draft, [key]: value });
  }

  async function submit() {
    if (fieldErrors.length > 0) return;

    if (!user) {
      stashPendingProfileDraft(draft);
      setSignInOpen(true);
      return;
    }

    setPublishStatus("publishing");
    setErrorMessage(null);
    const result: PublishProfileResult = isEdit
      ? await updateProfileDraft(draft)
      : await publishProfileDraft(draft);
    if (!result.ok) {
      if (result.status === 401) {
        stashPendingProfileDraft(draft);
        setSignInOpen(true);
        setPublishStatus("idle");
        return;
      }
      if (result.status === 422) {
        setErrorMessage(
          result.reason ??
            "That doesn't look right — please double check your details."
        );
        setPublishStatus("error");
        return;
      }
      setPublishStatus("error");
      return;
    }
    setPublishStatus("published");
    onSaved?.(result.candidate);
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
          <div className="flex items-center gap-3">
            <AvatarUpload
              name={draft.name || "?"}
              avatarUrl={
                isEdit
                  ? avatarUrl
                  : (user?.user_metadata?.avatar_url as string | undefined)
              }
              onUploaded={(url) => onAvatarChanged?.(url)}
              editable={isEdit}
            />
            <div className="flex-1">
              <CardTitle>
                <input
                  value={draft.name}
                  onChange={(event) => update("name", event.target.value)}
                  className={`${inputClass} text-xl font-semibold`}
                  aria-label="Your name"
                />
              </CardTitle>
              {draft.name.trim().length > 0 && !isValidName(draft.name) && (
                <p className="text-sm text-danger">Full name is required.</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 text-base">
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>
              Phone or email (so employers can reach you)
            </span>
            <input
              value={draft.contactDetails}
              onChange={(event) => update("contactDetails", event.target.value)}
              className={inputClass}
              aria-label="Phone or email"
            />
            {draft.contactDetails.trim().length > 0 &&
              !isValidContactDetails(draft.contactDetails) && (
                <p className="text-sm text-danger">
                  Enter a valid PH phone number (e.g. 0917 123 4567) or email
                  address.
                </p>
              )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>What kind of work</span>
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
              <span className={labelClass}>Category</span>
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
            <span className={labelClass}>About you</span>
            <Textarea
              value={draft.professionalSummary}
              onChange={(event) =>
                update("professionalSummary", event.target.value)
              }
              rows={3}
              className="text-base"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>City</span>
              <input
                value={draft.location}
                onChange={(event) => update("location", event.target.value)}
                className={inputClass}
                aria-label="City"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Years doing this work</span>
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
            <span className={labelClass}>
              Address (barangay/street, city) — helps match you with nearby
              employers, not shown publicly
            </span>
            <input
              value={draft.address}
              onChange={(event) => update("address", event.target.value)}
              className={inputClass}
              aria-label="Address"
            />
          </div>

          {!isEdit && <RateField draft={draft} onChange={onChange} />}

          {!isEdit && <PaymentMethodsField draft={draft} onChange={onChange} />}

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Skills (one per line)</span>
            <Textarea
              value={draft.skills.join("\n")}
              onChange={(event) =>
                update("skills", linesToArray(event.target.value))
              }
              rows={Math.max(3, draft.skills.length)}
              className="text-base"
            />
            <div className="flex flex-wrap gap-1.5">
              {draft.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {!isEdit && <AvailabilityFields draft={draft} onChange={onChange} />}

          {!isEdit && <GovernmentIdFields draft={draft} onChange={onChange} />}

          {publishStatus === "published" ? (
            <Button disabled variant="outline" className="w-full sm:w-fit">
              <Check className="size-4" />
              {isEdit ? "Changes saved" : "Profile saved"}
            </Button>
          ) : (
            <Button
              onClick={submit}
              className="w-full sm:w-fit"
              disabled={publishStatus === "publishing" || fieldErrors.length > 0}
            >
              <Sparkles className="size-4" />
              {publishStatus === "publishing"
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Save my profile"}
            </Button>
          )}
          {publishStatus === "published" && !isEdit && (
            <p className="text-sm text-muted-foreground">
              Saved privately — you can publish it so employers can find you
              from your dashboard.
            </p>
          )}
          {publishStatus === "error" && (
            <p className="text-sm text-danger">
              {errorMessage ??
                "Could not save your profile. Check your connection and try again."}
            </p>
          )}
          {!user && publishStatus === "idle" && (
            <p className="text-sm text-muted-foreground">
              You&apos;ll be asked to sign in with Google or your email before
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
        description="Sign in to publish it — we'll bring you right back."
      />
    </motion.div>
  );
}
