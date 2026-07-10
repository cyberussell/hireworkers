import type { ReactNode } from "react";

export function PhoneMockup({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
      >
        <div className="absolute top-1/2 left-1/2 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 blur-[90px]" />
      </div>
      <div className="relative aspect-[9/16] rounded-[2.5rem] bg-neutral-950 p-2.5 shadow-2xl">
        <div className="absolute top-2 left-1/2 z-10 h-4 w-24 -translate-x-1/2 rounded-full bg-neutral-950" />
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.1rem] bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}
