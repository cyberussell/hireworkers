import type { Metadata } from "next";
import { SeekerDashboard } from "@/components/seeker-dashboard/seeker-dashboard";

export const metadata: Metadata = {
  title: "Your Dashboard — Hire Workers That Work",
  description: "Manage your profile and take skill assessments.",
};

export default function WorkDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <SeekerDashboard />
    </div>
  );
}
