import { Suspense } from "react";
import type { Metadata } from "next";
import { HireExperience } from "@/components/hire/hire-experience";

export const metadata: Metadata = {
  title: "AI Hiring Assistant — Hire Workers That Work",
  description:
    "Describe who you need to hire and let the AI Hiring Assistant build the job brief for you.",
};

export default function HirePage() {
  return (
    <Suspense fallback={null}>
      <HireExperience />
    </Suspense>
  );
}
