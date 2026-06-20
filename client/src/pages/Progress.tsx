import { useEffect, useState } from "react";
import { api } from "../api";
import type { Exercise, Progress as ProgressData } from "../types";
import { LineChart } from "../components/Charts";
import StatCard from "../components/StatCard";
import { fmtDate, fmtVolume } from "../format";
import { TrendingUp, Dumbbell } from "../components/icons";

export default function Progress() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState("");
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .exercises()
      .then((ex) => {
        setExercises(ex);
        if (ex.length) setSelected(ex[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setData(null);
    api.progress(selected).then(setData).catch((e) => setError(e.message));
  }, [selected]);

  if (error) return <p className="text-red-400">{error}</p>;

  if (exercises.length === 0) {
    return <div className="card p-10 text-center text-white/60">Log a workout first to see progress.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Progress</h1>
        <select
          className="input"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {exercises.map((e) => (
            <option key={e.id} value={e.id} className="bg-slate-800">
              {e.name} ({e.usedCount})
            </option>
          ))}
        </select>
      </div>

      {!data ? (
        <p className="text-white/50">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Best set (PR)" value={`${data.pr.maxWeight} kg`} sub={data.exercise.name} icon={<Dumbbell size={18} />} />
            <StatCard label="Est. 1RM" value={`${data.pr.bestEst1RM} kg`} sub="Epley estimate" icon={<TrendingUp size={18} />} />
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3 text-white/70">
              <TrendingUp size={18} /> <span className="font-medium">Estimated 1RM over time</span>
            </div>
            <LineChart data={data.points.map((p) => ({ label: fmtDate(p.date), value: p.est1RM }))} />
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-white/40 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Top set</th>
                  <th className="text-right px-4 py-2">Volume</th>
                  <th className="text-right px-4 py-2">Est. 1RM</th>
                </tr>
              </thead>
              <tbody>
                {[...data.points].reverse().map((p, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="px-4 py-2">{fmtDate(p.date)}</td>
                    <td className="px-4 py-2">{p.maxWeight} kg × {p.topReps}</td>
                    <td className="px-4 py-2 text-right">{fmtVolume(p.volume)}</td>
                    <td className="px-4 py-2 text-right font-medium">{p.est1RM} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
