import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PremiumLockedPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="relative h-full gap-3 overflow-hidden border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Icon className="size-4" />
            {title}
          </CardTitle>
          <Badge variant="outline" className="gap-1 text-[10px] text-warning border-warning/30 bg-warning-subtle">
            <Lock className="size-2.5" />
            Premium
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
