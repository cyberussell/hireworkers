import type { Metadata } from "next";
import {
  BarChart3,
  Brain,
  CalendarClock,
  Gauge,
  Lightbulb,
  ListChecks,
  ListOrdered,
  MessagesSquare,
  ShieldAlert,
  ThumbsUp,
} from "lucide-react";
import { WidgetRecommendedCandidates } from "@/components/dashboard/widget-recommended-candidates";
import { WidgetReadyToday } from "@/components/dashboard/widget-ready-today";
import { WidgetRecentlyActive } from "@/components/dashboard/widget-recently-active";
import { WidgetActiveHiring } from "@/components/dashboard/widget-active-hiring";
import { WidgetEmptyPipeline } from "@/components/dashboard/widget-empty-pipeline";
import { PremiumLockedPanel } from "@/components/dashboard/premium-locked-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard — PayJobs.work",
  description: "Your AI hiring operations center.",
};

const AI_INSIGHTS = [
  "Bubble.io developers respond fastest between 9am–12pm PH time.",
  "Roles with a clear PHP salary range in the brief get matched to candidates 40% faster.",
  "Verified candidates have a 22% higher average response rate.",
];

const RECOMMENDED_ACTIONS = [
  "Try the AI Hiring Assistant to turn a plain-language need into a full job brief in minutes.",
  "Browse Candidates Ready Today if you need to fill a role this week.",
  "Open a candidate's Digital Work Passport to see verified skills before reaching out.",
];

const PREMIUM_PANELS = [
  {
    icon: Gauge,
    title: "Hiring Confidence Score",
    description:
      "A weighted score across skill match, portfolio quality, communication, verification, and reliability — with a plain-language explanation.",
  },
  {
    icon: Brain,
    title: "AI Learning Preferences",
    description:
      "Learns how you hire over time — remote vs. onsite, response speed, experience level — and sharpens future recommendations.",
  },
  {
    icon: ListOrdered,
    title: "AI Candidate Ranking",
    description:
      "Ranks candidates using your hiring history and behavior, not just a static profile score.",
  },
  {
    icon: ShieldAlert,
    title: "AI Risk Detection",
    description:
      "Flags inconsistent employment history, inactivity, weak portfolios, or incomplete verification before you commit.",
  },
  {
    icon: MessagesSquare,
    title: "AI Interview Assistant",
    description:
      "Generates personalized interview questions and flags what to validate live, based on the candidate and the role.",
  },
  {
    icon: ThumbsUp,
    title: "AI Follow-up Assistant",
    description:
      "Summarizes interviews, compares shortlisted candidates, and reminds you when a follow-up is overdue.",
  },
  {
    icon: BarChart3,
    title: "AI Hiring Analytics",
    description:
      "Hiring speed, response rates, candidate quality, and bottlenecks — with recommendations to fix them.",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your AI hiring operations center.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <WidgetRecommendedCandidates />
        <WidgetReadyToday />
        <WidgetActiveHiring />
        <WidgetEmptyPipeline
          icon={CalendarClock}
          title="Interview Pipeline"
          message="No interviews scheduled yet. Once you shortlist candidates, they'll show up here."
        />
        <WidgetRecentlyActive />

        <Card className="h-full gap-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="size-4 text-warning" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {AI_INSIGHTS.map((insight) => (
                <li key={insight} className="flex gap-2">
                  <span className="text-warning">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="h-full gap-3 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ListChecks className="size-4 text-primary" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {RECOMMENDED_ACTIONS.map((action) => (
                <li key={action} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Premium AI Features
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PREMIUM_PANELS.map((panel) => (
            <PremiumLockedPanel key={panel.title} {...panel} />
          ))}
        </div>
      </div>
    </div>
  );
}
