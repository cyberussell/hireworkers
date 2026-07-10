import type { Metadata } from "next";
import { hasMissionControlSession } from "@/lib/mission-control-auth";
import { MissionControlShell } from "@/components/mission-control/mission-control-shell";
import { MissionControlLoginGate } from "@/components/mission-control/mission-control-login-gate";

export const metadata: Metadata = {
  title: "Mission Control — Hire Workers That Work",
};

export default async function MissionControlPage() {
  const hasSession = await hasMissionControlSession();

  if (!hasSession) {
    return <MissionControlLoginGate />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <MissionControlShell />
    </div>
  );
}
