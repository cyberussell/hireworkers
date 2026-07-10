import Image from "next/image";
import { cn } from "@/lib/utils";

export function AiAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
        className
      )}
      aria-hidden="true"
    >
      <Image
        src="/hireworker-logo.png"
        alt=""
        width={24}
        height={24}
        className="size-[70%] object-contain"
      />
    </div>
  );
}
