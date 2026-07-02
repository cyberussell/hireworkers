import { cn } from "@/lib/utils";

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
};

export function AvatarGradient({
  seed,
  name,
  size = "md",
  className,
}: {
  seed: string;
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const hash = hashSeed(seed);
  const hueA = hash % 360;
  const hueB = (hueA + 46) % 360;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        sizeClasses[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hueA} 70% 52%), hsl(${hueB} 70% 42%))`,
      }}
      aria-hidden="true"
    >
      {initialsFor(name)}
    </div>
  );
}
