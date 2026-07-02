import type { Metadata } from "next";
import { JobsExperience } from "@/components/jobs/jobs-experience";

export const metadata: Metadata = {
  title: "Find Work — PayJobs.work",
  description: "Browse jobs posted by employers on PayJobs.work.",
};

export default function JobsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Find Work</h1>
        <p className="text-sm text-muted-foreground">
          Jobs posted by employers, ready to apply.
        </p>
      </div>
      <JobsExperience />
    </div>
  );
}
