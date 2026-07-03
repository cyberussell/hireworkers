import type { Metadata } from "next";
import { WorkExperience } from "@/components/work/work-experience";

export const metadata: Metadata = {
  title: "Build Your Profile — Hire Workers That Work",
  description:
    "Tell our AI Profile Assistant about your work in your own words — no forms, no resume required.",
};

export default function WorkPage() {
  return <WorkExperience />;
}
