// A baseline headstart, not a lie — grows for real as people publish
// profiles, but doesn't start the platform at zero on day one.
const BASELINE_WORKERS = 500;

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-3xl font-bold text-primary sm:text-4xl">
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function StatsStrip({ publishedCount }: { publishedCount: number }) {
  const workersJoined = BASELINE_WORKERS + publishedCount;

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-6 border-t border-border/60 py-10">
      <StatItem
        value={`${workersJoined.toLocaleString()}+`}
        label="Manggagawang Sumali"
      />
      <StatItem value="25+" label="Uri ng Trabaho" />
      <StatItem value="24/7" label="AI Profile Assistant" />
    </div>
  );
}
