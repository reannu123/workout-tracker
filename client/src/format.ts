export const fmtVolume = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`;

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const fmtFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
