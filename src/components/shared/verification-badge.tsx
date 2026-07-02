import { ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Candidate } from "@/types/candidate";

export function VerificationBadge({
  verified,
}: {
  verified: Candidate["verified"];
}) {
  const verifiedCount = Object.values(verified).filter(Boolean).length;
  if (verifiedCount === 0) return null;

  const items = [
    verified.identity && "Identity verified",
    verified.email && "Email verified",
    verified.phone && "Phone verified",
  ].filter(Boolean) as string[];

  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex items-center gap-1 rounded-full bg-trust-subtle px-2 py-0.5 text-xs font-medium text-trust">
        <ShieldCheck className="size-3" />
        Verified
      </TooltipTrigger>
      <TooltipContent>
        <ul className="text-xs">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
