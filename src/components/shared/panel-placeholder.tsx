import type { LucideIcon } from "lucide-react";

export function PanelPlaceholder({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
      <Icon className="size-6 text-primary/60" />
      <p className="max-w-xs text-sm">{message}</p>
    </div>
  );
}
