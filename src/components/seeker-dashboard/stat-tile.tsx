export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
      {hint && <span className="text-xs text-trust">{hint}</span>}
    </div>
  );
}
