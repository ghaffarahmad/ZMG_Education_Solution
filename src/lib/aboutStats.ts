export interface AboutStat {
  value: number;
  suffix: string;
  label: string;
}

export const DEFAULT_ABOUT_STATS: AboutStat[] = [
  { value: 2000, suffix: "+", label: "Students Assisted" },
  { value: 3, suffix: "", label: "Major Boards" },
  { value: 100, suffix: "%", label: "Secure Portal" },
  { value: 24, suffix: "/7", label: "Document Access" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizedNumber(value: unknown, fallback: number) {
  const numericValue =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : fallback;
}

export function normalizeAboutStats(stats: unknown): AboutStat[] {
  if (!Array.isArray(stats)) {
    return DEFAULT_ABOUT_STATS.map((stat) => ({ ...stat }));
  }

  return DEFAULT_ABOUT_STATS.map((fallback, index) => {
    const stat = stats[index];

    if (!isRecord(stat)) {
      return { ...fallback };
    }

    const label = typeof stat.label === "string" && stat.label.trim() ? stat.label.trim() : fallback.label;
    const suffix = typeof stat.suffix === "string" ? stat.suffix.trim() : fallback.suffix;

    return {
      value: normalizedNumber(stat.value, fallback.value),
      suffix,
      label,
    };
  });
}
