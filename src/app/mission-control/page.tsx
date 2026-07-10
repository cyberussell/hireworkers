import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { requireUser } from "@/lib/supabase/server";
import { MissionControlPanel } from "@/components/mission-control/mission-control-panel";

export const metadata: Metadata = {
  title: "Mission Control — Hire Workers That Work",
};

export default async function MissionControlPage() {
  const user = await requireUser();
  if (!isAdminEmail(user?.email)) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <MissionControlPanel />
    </div>
  );
}
