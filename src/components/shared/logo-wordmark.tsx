import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-lg font-bold tracking-tight text-brand-job",
        className
      )}
      aria-label="Hire Workers That Work — Home"
    >
      <Image
        src="/hireworker-logo.png"
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0"
      />
      Hire Workers That Work
    </Link>
  );
}
