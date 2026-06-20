import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { SessionListItem } from "../types";
import { fmtFullDate, fmtVolume } from "../format";
import { Trash, ChevronRight, Plus } from "../components/icons";

export default function History() {
  const [sessions, setSessions] = useState<SessionListItem[] | null>(null);
  const [error, setError] = useState("");

  const load = () => api.sessions().then(setSessions).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    await api.deleteSession(id);
    setSessions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
  };

  if (error) return <p className="text-red-400">{error}</p>;
  if (!sessions) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <Link to="/log" className="btn-primary inline-flex items-center gap-1"><Plus /> Log</Link>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-10 text-center text-white/60">No sessions yet.</div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="card p-4 flex items-center gap-3">
              <Link to={`/session/${s.id}`} className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{fmtFullDate(s.performedAt)}</span>
                  <span className="text-sm text-white/50">
                    {fmtVolume(s.totalVolume)} kg · {s.totalSets} sets{s.durationMin ? ` · ${s.durationMin}m` : ""}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {s.exerciseNames.map((n, i) => (
                    <span key={i} className="text-xs rounded-md bg-white/10 px-2 py-0.5 text-white/70">{n}</span>
                  ))}
                </div>
              </Link>
              <button onClick={() => remove(s.id)} className="text-white/30 hover:text-red-400" title="Delete">
                <Trash />
              </button>
              <Link to={`/session/${s.id}`} className="text-white/30 hover:text-white"><ChevronRight /></Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
