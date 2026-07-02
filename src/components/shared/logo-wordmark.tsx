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
      aria-label="Job Work Pay — Home"
    >
      <span className="text-brand-job">Job</span>
      <span className="text-muted-foreground">.</span>
      <span className="text-brand-work">Work</span>
      <span className="text-muted-foreground">.</span>
      <span className="text-brand-pay">Pay</span>
    </Link>
  );
}
