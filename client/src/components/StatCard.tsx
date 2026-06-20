import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-white/50">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-white/40">{sub}</div>}
    </div>
  );
}
