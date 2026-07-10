import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Rocket, Sparkles, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How To's — Hire Workers That Work Help",
  description:
    "How the AI Profile Assistant builds your professional profile from a conversation — no forms, no résumé required.",
};

const PROFILE_STEPS = [
  {
    icon: UserPlus,
    title: "Sign in",
    body: "Continue with Google, or create an account with your email — no forms to fill out first.",
  },
  {
    icon: Sparkles,
    title: "Talk to the AI",
    body: "Answer a few natural questions in English, Tagalog, or Taglish — whatever's easiest for you. No résumé needed.",
  },
  {
    icon: Rocket,
    title: "Review and publish",
    body: "Your profile saves automatically as you go. When you're happy with it, publish it so employers browsing Find Talent can see it.",
  },
  {
    icon: LayoutDashboard,
    title: "Keep it up to date",
    body: "Edit anything from your dashboard anytime, and see how many people have viewed your profile.",
  },
];

const FAQS = [
  {
    q: "Do I need a résumé or CV?",
    a: "No. The AI builds your profile entirely from your answers during the conversation — there's nothing to write or upload.",
  },
  {
    q: "What languages can I use?",
    a: "English, Tagalog, or Taglish — mix and match however's natural for you. The AI follows your lead.",
  },
  {
    q: "Who can see my profile?",
    a: "Nobody, until you publish it. Before that, it's saved privately and only visible to you.",
  },
  {
    q: "Can I change my answers later?",
    a: "Yes — open your dashboard and hit Edit. Nothing about publishing is final.",
  },
  {
    q: "I don't have a Google account — can I still sign up?",
    a: "Yes. Use \"Walang Google account? Mag-sign up gamit ang email\" on the homepage to create an account with just an email and password.",
  },
  {
    q: "How do I sign out?",
    a: "Click your name in the top-right corner of any page, then Sign out.",
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
          Quick guide to building your professional profile with the AI.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            How to Build Your Profile
          </h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/work" />}
          >
            Get started
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROFILE_STEPS.map((step, i) => (
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
