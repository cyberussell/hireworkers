import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WidgetEmptyPipeline({
  icon: Icon,
  title,
  message,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
}) {
  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/hire" />}
        >
          Start with AI Hiring Assistant
        </Button>
      </CardContent>
    </Card>
  );
}
