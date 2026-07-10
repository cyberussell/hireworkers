"use client";

import { useState } from "react";
import {
  MissionControlSidebar,
  type MissionControlView,
} from "@/components/mission-control/mission-control-sidebar";
import { MissionControlDashboard } from "@/components/mission-control/mission-control-dashboard";
import { MissionControlRequestsPanel } from "@/components/mission-control/mission-control-requests-panel";

export function MissionControlShell() {
  const [view, setView] = useState<MissionControlView>("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-[70vh] flex-col sm:flex-row">
      <MissionControlSidebar
        view={view}
        onViewChange={setView}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
      />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        {view === "dashboard" ? (
          <MissionControlDashboard />
        ) : (
          <MissionControlRequestsPanel />
        )}
      </div>
    </div>
  );
}
