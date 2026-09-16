import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { DraftExercise, Exercise } from "../types";
import { Plus, Trash } from "../components/icons";

const emptySet = () => ({ reps: "", weight: "", rpe: "", isWarmup: false });
const emptyExercise = (): DraftExercise => ({ name: "", sets: [emptySet()] });

export default function Log() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [known, setKnown] = useState<Exercise[]>([]);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<DraftExercise[]>([emptyExercise()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(!editing);

  useEffect(() => {
    api.exercises().then(setKnown).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;

    api.session(id)
      .then((session) => {
        setDuration(session.durationMin != null ? String(session.durationMin) : "");
        setNotes(session.notes || "");
        setExercises(
          session.exercises.length > 0
            ? session.exercises.map((item) => ({
                name: item.exercise.name,
                sets: item.sets.map((set) => ({
                  reps: String(set.reps),
                  weight: String(set.weight),
                  rpe: set.rpe != null ? String(set.rpe) : "",
                  isWarmup: set.isWarmup,
                })),
              }))
            : [emptyExercise()]
        );
        setReady(true);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const update = (fn: (draft: DraftExercise[]) => void) =>
    setExercises((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  const knownExercise = (name: string) =>
    known.find((exercise) => exercise.name.toLowerCase() === name.trim().toLowerCase());

  const selectExercise = (exerciseIndex: number, name: string) => {
    const selected = knownExercise(name);

    update((draft) => {
      const exercise = draft[exerciseIndex];
      const changedExercise =
        exercise.name.trim().toLowerCase() !== selected?.name.toLowerCase();

      exercise.name = selected?.name ?? name;
      if (changedExercise && selected?.lastSet) {
        exercise.sets = [{
          reps: String(selected.lastSet.reps),
          weight: String(selected.lastSet.weight),
          rpe: "",
          isWarmup: false,
        }];
      }
    });
  };

  const save = async () => {
    setError("");
    const payload = {
      durationMin: duration ? Number(duration) : undefined,
      notes: notes || undefined,
      exercises: exercises
        .map((e) => ({
          name: e.name.trim(),
          sets: e.sets
            .filter((s) => Number(s.reps) > 0)
            .map((s) => ({
              reps: Number(s.reps),
              weight: Number(s.weight) || 0,
              rpe: s.rpe ? Number(s.rpe) : undefined,
              isWarmup: s.isWarmup,
            })),
        }))
        .filter((e) => e.name && e.sets.length > 0),
    };
    if (payload.exercises.length === 0) {
      setError("Add at least one exercise with a set (reps > 0).");
      return;
    }
    setSaving(true);
    try {
      const saved = id
        ? await api.updateSession(id, payload)
        : await api.createSession(payload);
      navigate(`/session/${saved.id}`);
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  if (!ready) {
    return <p className={error ? "text-red-400" : "text-white/50"}>{error || "Loading workout…"}</p>;
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {id && <Link to={`/session/${id}`} className="text-white/50 hover:text-white text-sm">← Workout</Link>}
      <h1 className="text-2xl font-bold">{editing ? "Edit workout" : "Log workout"}</h1>

      <datalist id="known-exercises">
        {known.filter((e) => e.usedCount > 0).map((e) => (
          <option
            key={e.id}
            value={e.name}
            label={e.lastSet ? `Last: ${e.lastSet.reps} reps at ${e.lastSet.weight} kg` : undefined}
          />
        ))}
      </datalist>

      {exercises.map((ex, ei) => {
        const previousSet = knownExercise(ex.name)?.lastSet;

        return <div key={ei} className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              className="input flex-1"
              list="known-exercises"
              placeholder="Exercise (e.g. Bench Press)"
              value={ex.name}
              onChange={(e) => selectExercise(ei, e.target.value)}
            />
            {exercises.length > 1 && (
              <button className="btn-ghost px-2" title="Remove exercise" onClick={() => update((d) => d.splice(ei, 1))}>
                <Trash />
              </button>
            )}
          </div>

          {previousSet && (
            <p className="text-xs text-white/40">
              Last logged: {previousSet.reps} reps at {previousSet.weight} kg
            </p>
          )}

          <div className="space-y-2">
            <div className="grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_2rem] gap-2 text-xs text-white/40 px-1">
              <span>#</span><span>Reps</span><span>Weight</span><span>RPE</span><span>Warmup</span><span />
            </div>
            {ex.sets.map((s, si) => (
              <div key={si} className="grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_2rem] gap-2 items-center">
                <span className="text-white/40 text-sm">{si + 1}</span>
                <input className="input" type="number" inputMode="numeric" placeholder="reps" value={s.reps}
                  onChange={(e) => update((d) => (d[ei].sets[si].reps = e.target.value))} />
                <input className="input" type="number" inputMode="decimal" placeholder="kg" value={s.weight}
                  onChange={(e) => update((d) => (d[ei].sets[si].weight = e.target.value))} />
                <input className="input" type="number" inputMode="decimal" placeholder="—" value={s.rpe}
                  onChange={(e) => update((d) => (d[ei].sets[si].rpe = e.target.value))} />
                <label className="flex items-center justify-center">
                  <input type="checkbox" checked={s.isWarmup}
                    onChange={(e) => update((d) => (d[ei].sets[si].isWarmup = e.target.checked))} />
                </label>
                {ex.sets.length > 1 ? (
                  <button className="text-white/40 hover:text-red-400" title="Remove set"
                    onClick={() => update((d) => d[ei].sets.splice(si, 1))}>
                    <Trash size={14} />
                  </button>
                ) : <span />}
              </div>
            ))}
            <button className="text-emerald-400 text-sm inline-flex items-center gap-1 hover:text-emerald-300"
              onClick={() => update((d) => {
                const last = d[ei].sets[d[ei].sets.length - 1];
                d[ei].sets.push({ reps: "", weight: last?.weight ?? "", rpe: "", isWarmup: false });
              })}>
              <Plus size={14} /> Add set
            </button>
          </div>
        </div>;
      })}

      <button className="btn-ghost w-full inline-flex items-center justify-center gap-1"
        onClick={() => setExercises((p) => [...p, emptyExercise()])}>
        <Plus /> Add exercise
      </button>

      <div className="card p-4 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-white/60">
          Duration (min)
          <input className="input" type="number" inputMode="numeric" placeholder="optional"
            value={duration} onChange={(e) => setDuration(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/60">
          Notes
          <input className="input" placeholder="optional" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button className="btn-primary w-full" disabled={saving} onClick={save}>
        {saving ? "Saving…" : editing ? "Save changes" : "Save workout"}
      </button>
    </div>
  );
}
