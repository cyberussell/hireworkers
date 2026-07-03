import { HeroPrompt } from "@/components/home/hero-prompt";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-10 px-4 py-16 text-center sm:px-6">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Hire Skills. Not Degrees.
        </h1>
        <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          Describe the work you need done. We match you with people who have
          the skill, experience, and reliability to get it done — judged by
          what they can do, not what&apos;s on paper.
        </p>
      </div>

      <HeroPrompt />
    </div>
  );
}
