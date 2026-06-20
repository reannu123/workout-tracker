import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Summary } from "../types";
import StatCard from "../components/StatCard";
import { BarChart } from "../components/Charts";
import { fmtVolume, fmtDate } from "../format";
import { Flame, Calendar, Clock, Dumbbell, TrendingUp, Plus } from "../components/icons";

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.summary().then(setSummary).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!summary) return <p className="text-white/50">Loading…</p>;

  const empty = summary.totalSessions === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-white/50 text-sm">Your training at a glance.</p>
        </div>
        <Link to="/log" className="btn-primary inline-flex items-center gap-1">
          <Plus /> Log workout
        </Link>
      </div>

      {empty ? (
        <div className="card p-10 text-center text-white/60">
          <Dumbbell size={36} className="mx-auto mb-3 opacity-60" />
          <p className="text-lg text-white/80">No workouts logged yet</p>
          <p className="text-sm">Log your first session to start tracking progress.</p>
          <Link to="/log" className="btn-primary inline-flex items-center gap-1 mt-4">
            <Plus /> Log a workout
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total volume" value={`${fmtVolume(summary.totalVolume)} kg`} sub={`${summary.totalSets} sets`} icon={<Dumbbell size={18} />} />
            <StatCard label="Sessions" value={String(summary.totalSessions)} sub={`${summary.last30Sessions} in 30d`} icon={<Calendar size={18} />} />
            <StatCard label="Current streak" value={`${summary.currentStreak}d`} sub={`${summary.workoutDays} workout days`} icon={<Flame size={18} />} />
            <StatCard label="Avg duration" value={summary.avgDurationMin ? `${summary.avgDurationMin}m` : "—"} sub="per session" icon={<Clock size={18} />} />
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3 text-white/70">
              <TrendingUp size={18} /> <span className="font-medium">Volume per session</span>
            </div>
            <BarChart data={summary.volumeTrend.map((d) => ({ label: fmtDate(d.date), value: d.volume }))} />
          </div>
        </>
      )}
    </div>
  );
}
