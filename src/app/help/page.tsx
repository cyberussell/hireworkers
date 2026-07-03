import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  FileSearch,
  MessagesSquare,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How To's — Hire Workers That Work Help",
  description:
    "Step-by-step guides for hiring with the AI Hiring Assistant and building your profile to find work on Hire Workers That Work.",
};

const EMPLOYER_STEPS = [
  {
    icon: Sparkles,
    title: "Describe who you need",
    body: "Go to Ask AI and tell the AI Hiring Assistant about the role in plain language — no forms required.",
  },
  {
    icon: FileSearch,
    title: "Review the job brief",
    body: "The assistant turns your description into a full job brief with a suggested salary range and required skills. Edit anything before you continue.",
  },
  {
    icon: UserCheck,
    title: "Browse matched candidates",
    body: "See a ranked list of candidates with match scores and reasons. Open a profile's Digital Work Passport to check verified skills.",
  },
  {
    icon: MessagesSquare,
    title: "Interview and hire",
    body: "Use the AI-suggested interview questions to evaluate candidates, then reach out to make an offer.",
  },
];

const SEEKER_STEPS = [
  {
    icon: UserPlus,
    title: "Tell us about your work",
    body: "Go to Find Work and describe your experience, skills, and what you're looking for — the AI Profile Assistant builds your profile from your own words.",
  },
  {
    icon: Sparkles,
    title: "Let AI build your profile",
    body: "The assistant organizes your experience into a clear, professional profile that employers can search and match against.",
  },
  {
    icon: Briefcase,
    title: "Get matched to roles",
    body: "Employers see your profile when your skills match what they need. Higher match scores mean a closer fit to the role.",
  },
  {
    icon: MessagesSquare,
    title: "Respond and get hired",
    body: "Check your Dashboard for messages from employers and respond promptly — fast replies improve your visibility.",
  },
];

const FAQS = [
  {
    q: "What is the AI Hiring Assistant?",
    a: "It's the tool behind Ask AI that turns a plain-language description of who you need into a structured job brief, then matches it against candidate profiles.",
  },
  {
    q: "How are match scores calculated?",
    a: "Match scores compare the skills, experience, and requirements in a job brief against a candidate's profile. They're a guide to help you prioritize review, not a guarantee of fit.",
  },
  {
    q: "What does a verification badge mean?",
    a: "It shows what has been verified about a candidate and how. It reflects only what was checked — always review a candidate's profile yourself before deciding.",
  },
  {
    q: "Where do I manage my account?",
    a: "Use the Dashboard to review activity, manage your pipeline, and access account settings.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How To&apos;s
        </h1>
        <p className="text-sm text-muted-foreground">
          Quick guides to get the most out of Hire Workers That Work.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            For Employers: How to Hire
          </h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/hire" />}
          >
            Ask AI
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {EMPLOYER_STEPS.map((step, i) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <step.icon className="size-4 text-foreground/60" />
                {step.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            For Job Seekers: How to Find Work
          </h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/work" />}
          >
            Find Work
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SEEKER_STEPS.map((step, i) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <step.icon className="size-4 text-foreground/60" />
                {step.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col divide-y divide-border/60 rounded-xl ring-1 ring-foreground/10">
          {FAQS.map((faq) => (
            <div key={faq.q} className="flex flex-col gap-1.5 px-4 py-4">
              <p className="text-sm font-medium">{faq.q}</p>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-xl bg-muted/40 px-4 py-6 text-center">
        <p className="text-sm font-medium">Still need help?</p>
        <p className="text-sm text-muted-foreground">
          Reach out at{" "}
          <a
            href="mailto:support@hireworkers.work"
            className="text-primary underline underline-offset-2"
          >
            support@hireworkers.work
          </a>
        </p>
      </section>
    </div>
  );
}
