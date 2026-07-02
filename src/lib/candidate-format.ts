import type { Availability } from "@/types/candidate";

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  immediately: "Available now",
  within_2_weeks: "Available in 2 weeks",
  within_month: "Available within a month",
  not_available: "Not available",
};

export function formatRelativeDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const now = new Date();
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) return "Active today";
  if (diffDays === 1) return "Active yesterday";
  if (diffDays < 7) return `Active ${diffDays} days ago`;
  if (diffDays < 30) return `Active ${Math.floor(diffDays / 7)}w ago`;
  return `Active ${Math.floor(diffDays / 30)}mo ago`;
}

export function formatSalaryRange(min: number, max: number, period: string) {
  const suffix = period === "hour" ? "/hr" : period === "month" ? "/mo" : "/project";
  return `₱${min.toLocaleString()}–${max.toLocaleString()}${suffix}`;
}
