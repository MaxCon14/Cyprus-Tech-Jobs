import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number | null, max?: number | null, currency = "EUR") {
  const symbol = currency === "EUR" ? "€" : currency;
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `${symbol}${Math.round(n / 1000)}K` : `${symbol}${n}`;
  if (min && max) return `${fmt(min)} — ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

/**
 * Salary ranges are mandatory on employer listings (EU Pay Transparency
 * Directive), so every route that can publish a job validates through here —
 * post, publish-a-draft and edit — rather than each rolling its own rule.
 * Returns human-readable errors; an empty array means the range is acceptable.
 */
export function validateSalaryRange(min: unknown, max: unknown): string[] {
  const errors: string[] = [];
  const toNum = (v: unknown) =>
    v === null || v === undefined || String(v).trim() === "" ? null : Number(v);

  const lo = toNum(min);
  const hi = toNum(max);

  if (lo === null) errors.push("Minimum salary is required.");
  else if (!Number.isFinite(lo) || lo <= 0) errors.push("Minimum salary must be a positive number.");

  if (hi === null) errors.push("Maximum salary is required.");
  else if (!Number.isFinite(hi) || hi <= 0) errors.push("Maximum salary must be a positive number.");

  if (errors.length === 0 && lo! > hi!) {
    errors.push("Maximum salary must be higher than the minimum.");
  }
  return errors;
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 60)  return `${mins}M AGO`;
  if (hours < 24) return `${hours}H AGO`;
  if (days < 7)   return `${days}D AGO`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase();
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function remoteLabel(type: string) {
  const map: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ON_SITE: "On-site",
  };
  return map[type] ?? type;
}

export function experienceLabel(level: string) {
  const map: Record<string, string> = {
    JUNIOR: "Junior",
    MID: "Mid-level",
    SENIOR: "Senior",
    LEAD: "Lead",
    EXECUTIVE: "Executive",
  };
  return map[level] ?? level;
}
