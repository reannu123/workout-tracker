import type { TagColor } from "./types";

export const TAG_COLOR_OPTIONS: { value: TagColor; label: string; swatch: string }[] = [
  { value: "emerald", label: "Emerald", swatch: "bg-emerald-400" },
  { value: "blue", label: "Blue", swatch: "bg-blue-400" },
  { value: "violet", label: "Violet", swatch: "bg-violet-400" },
  { value: "amber", label: "Amber", swatch: "bg-amber-400" },
  { value: "rose", label: "Rose", swatch: "bg-rose-400" },
  { value: "cyan", label: "Cyan", swatch: "bg-cyan-400" },
];

const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  emerald: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  blue: "border-blue-400/30 bg-blue-500/15 text-blue-200",
  violet: "border-violet-400/30 bg-violet-500/15 text-violet-200",
  amber: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  rose: "border-rose-400/30 bg-rose-500/15 text-rose-200",
  cyan: "border-cyan-400/30 bg-cyan-500/15 text-cyan-200",
};

export const tagColorClasses = (color: TagColor) =>
  TAG_COLOR_CLASSES[color] || TAG_COLOR_CLASSES.emerald;
