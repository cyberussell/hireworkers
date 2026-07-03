import type { Metadata } from "next";
import { TalentExperience } from "@/components/talent/talent-experience";

export const metadata: Metadata = {
  title: "Find Talent — PayJobs.work",
  description:
    "Browse verified, skilled Filipino talent — tradespeople, caregivers, and hands-on professionals — no degree required.",
};

export default function TalentPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Find Talent</h1>
        <p className="text-sm text-muted-foreground">
          Verified, skilled Filipino talent, ready to work — judged on real
          experience, not a diploma.
        </p>
      </div>
      <TalentExperience />
    </div>
  );
}
