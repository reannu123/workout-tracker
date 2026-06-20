// Minimal inline SVG icons (no icon dependency).
type P = { size?: number; className?: string };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const Dumbbell = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" />
    <path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" />
  </svg>
);
export const Plus = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
export const Trash = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
export const Flame = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
);
export const Clock = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const Calendar = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>
);
export const ChevronRight = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="m9 18 6-6-6-6" /></svg>
);
export const TrendingUp = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M22 7 13.5 15.5l-5-5L2 17" /><path d="M16 7h6v6" /></svg>
);
