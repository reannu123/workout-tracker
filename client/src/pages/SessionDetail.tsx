import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { SessionFull } from "../types";
import { fmtFullDate, fmtVolume } from "../format";
import { Trash } from "../components/icons";

export default function SessionDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.session(id).then(setSession).catch((e) => setError(e.message));
  }, [id]);

  const remove = async () => {
    if (!confirm("Delete this session?")) return;
    await api.deleteSession(id);
    navigate("/history");
  };

  if (error) return <p className="text-red-400">{error}</p>;
  if (!session) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link to="/history" className="text-white/50 hover:text-white text-sm">← History</Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{fmtFullDate(session.performedAt)}</h1>
          <p className="text-white/50 text-sm">
            {fmtVolume(session.stats?.totalVolume ?? 0)} kg volume · {session.stats?.totalSets ?? 0} sets
            {session.durationMin ? ` · ${session.durationMin} min` : ""}
          </p>
          {session.notes && <p className="mt-1 text-white/70 italic">“{session.notes}”</p>}
        </div>
        <button onClick={remove} className="btn-ghost px-2" title="Delete session"><Trash /></button>
      </div>

      {session.exercises.map((se) => (
        <div key={se.id} className="card p-4">
          <h2 className="font-semibold mb-2">{se.exercise.name}</h2>
          <table className="w-full text-sm">
            <thead className="text-white/40 text-xs">
              <tr><th className="text-left font-normal py-1">Set</th><th className="text-left font-normal">Reps</th><th className="text-left font-normal">Weight</th><th className="text-left font-normal">RPE</th></tr>
            </thead>
            <tbody>
              {se.sets.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="py-1.5">{s.setNumber}{s.isWarmup && <span className="ml-1 text-[10px] text-amber-400">warmup</span>}</td>
                  <td>{s.reps}</td>
                  <td>{s.weight} kg</td>
                  <td className="text-white/50">{s.rpe ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
