import { Check, X } from "lucide-react";
import type { Candidate } from "@/types/candidate";

const ITEMS: { key: keyof Candidate["verified"]; label: string }[] = [
  { key: "identity", label: "Government ID" },
  { key: "email", label: "Email address" },
  { key: "phone", label: "Phone number" },
];

export function VerifiedIdentity({ candidate }: { candidate: Candidate }) {
  const hasSelfDeclaredId = Boolean(candidate.governmentIdType);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Verification
      </h2>
      <ul className="flex flex-col gap-2">
        {ITEMS.map((item) => {
          const isVerified = candidate.verified[item.key];
          return (
            <li key={item.key} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm">
                {isVerified ? (
                  <Check className="size-4 text-trust" />
                ) : (
                  <X className="size-4 text-muted-foreground" />
                )}
                <span className={isVerified ? "" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
              {item.key === "identity" && !isVerified && hasSelfDeclaredId && (
                <p className="pl-6 text-xs text-muted-foreground">
                  ID submitted — pending verification
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
