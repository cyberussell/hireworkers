import { Sparkles } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function AiUnavailableBanner() {
  return (
    <Alert className="border-warning/30 bg-warning-subtle">
      <Sparkles className="size-4 text-warning" />
      <AlertTitle>AI Hiring Assistant is not configured yet</AlertTitle>
      <AlertDescription>
        This environment doesn&apos;t have an Anthropic API key set up, so the
        assistant can&apos;t respond right now. Add{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          ANTHROPIC_API_KEY
        </code>{" "}
        to your environment to enable it.
      </AlertDescription>
    </Alert>
  );
}
