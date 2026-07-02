import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-[1px] text-lg font-bold tracking-tight",
        className
      )}
      aria-label="Payjobs.work — Home"
    >
      <span className="text-brand-pay">Pay</span>
      <span className="text-brand-job">jobs</span>
      <span className="text-brand-work">.work</span>
    </Link>
  );
}
