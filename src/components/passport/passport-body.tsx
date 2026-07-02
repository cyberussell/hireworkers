import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PassportHeader } from "@/components/passport/passport-header";
import { AiFitSummary } from "@/components/passport/ai-fit-summary";
import { SkillsSection } from "@/components/passport/skills-section";
import { PortfolioSection } from "@/components/passport/portfolio-section";
import { WorkHistorySection } from "@/components/passport/work-history-section";
import { AssessmentsSection } from "@/components/passport/assessments-section";
import { AvailabilityCard } from "@/components/passport/availability-card";
import { VerifiedIdentity } from "@/components/passport/verified-identity";
import { Separator } from "@/components/ui/separator";
import type { Candidate } from "@/types/candidate";

export function PassportBody({ candidate }: { candidate: Candidate }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/talent"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Find Talent
      </Link>

      <PassportHeader candidate={candidate} />

      <div className="mt-6">
        <AiFitSummary candidateId={candidate.id} />
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              About
            </h2>
            <p className="text-sm leading-relaxed text-foreground/90">
              {candidate.professionalSummary}
            </p>
          </section>

          <SkillsSection candidate={candidate} />
          <PortfolioSection candidate={candidate} />
          <WorkHistorySection candidate={candidate} />
          <AssessmentsSection candidate={candidate} />
        </div>

        <div className="flex flex-col gap-4">
          <AvailabilityCard candidate={candidate} />
          <VerifiedIdentity candidate={candidate} />
        </div>
      </div>
    </div>
  );
}
