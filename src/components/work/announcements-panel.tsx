import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Reserved space for announcements, promotions, and similar content later —
// intentionally simple for now rather than half-building a real content
// system before there's anything to put in it.
export function AnnouncementsPanel() {
  return (
    <Card className="h-fit gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Megaphone className="size-4 text-warning" />
          Mga Anunsyo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Wala pang bagong anunsyo. Babalik kami dito paminsan-minsan.
        </p>
      </CardContent>
    </Card>
  );
}
