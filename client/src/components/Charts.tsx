// Dependency-free SVG charts.
type Point = { label: string; value: number };

const W = 640;
const H = 200;
const PAD = { l: 8, r: 8, t: 16, b: 24 };

export function BarChart({ data }: { data: Point[] }) {
  if (data.length === 0) return <Empty />;
  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const slot = innerW / data.length;
  const barW = Math.min(slot * 0.6, 46);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Volume per session">
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = PAD.l + i * slot + (slot - barW) / 2;
        const y = PAD.t + (innerH - h);
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={4} fill="#10b981" opacity={0.85}>
              <title>{`${d.label}: ${Math.round(d.value)}`}</title>
            </rect>
            {(i % 2 === 0 || data.length <= 8) && (
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({ data }: { data: Point[] }) {
  if (data.length === 0) return <Empty />;
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.t + innerH - ((v - min) / span) * innerH;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.value)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Progress over time">
      <path d={path} fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r={3.5} fill="#34d399">
            <title>{`${d.label}: ${Math.round(d.value)}`}</title>
          </circle>
          {(i % 2 === 0 || data.length <= 8) && (
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
              {d.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Empty() {
  return <div className="py-10 text-center text-white/40 text-sm">Not enough data yet.</div>;
}
