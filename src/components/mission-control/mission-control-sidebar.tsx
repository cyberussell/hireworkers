"use client";

import { LayoutDashboard, Inbox, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type MissionControlView = "dashboard" | "requests";

const NAV_ITEMS: { view: MissionControlView; label: string; icon: typeof LayoutDashboard }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "requests", label: "Requests", icon: Inbox },
];

export function MissionControlSidebar({
  view,
  onViewChange,
  collapsed,
  onToggleCollapsed,
}: {
  view: MissionControlView;
  onViewChange: (view: MissionControlView) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col gap-1 border-r border-border/60 py-4 transition-[width] duration-200",
        collapsed ? "w-14 items-center px-2" : "w-full sm:w-56 px-2"
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "mb-3 flex items-center gap-2 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed ? "justify-center" : "self-end"
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </button>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = view === item.view;
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => onViewChange(item.view)}
            title={item.label}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              collapsed ? "w-10 justify-center px-0" : "w-full",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        );
      })}
    </aside>
  );
}
