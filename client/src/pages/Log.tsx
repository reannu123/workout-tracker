import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { DraftExercise, Exercise } from "../types";
import { ChevronDown, Plus, Trash } from "../components/icons";

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
  const [openExercise, setOpenExercise] = useState<number | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

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

  useEffect(() => {
    if (openExercise == null) return;

    const closeSuggestions = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!target.closest(`[data-exercise-picker="${openExercise}"]`)) {
        setOpenExercise(null);
      }
    };

    document.addEventListener("pointerdown", closeSuggestions, true);
    return () => document.removeEventListener("pointerdown", closeSuggestions, true);
  }, [openExercise]);

  const update = (fn: (draft: DraftExercise[]) => void) =>
    setExercises((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  const knownExercise = (name: string) =>
    known.find((exercise) => exercise.name.toLowerCase() === name.trim().toLowerCase());

  const exerciseSuggestions = (name: string) => {
    const usedExercises = known.filter((exercise) => exercise.usedCount > 0);
    const query = name.trim().toLowerCase();

    if (!query || knownExercise(name)) return usedExercises;
    return usedExercises.filter((exercise) => exercise.name.toLowerCase().includes(query));
  };

  const changeExerciseName = (exerciseIndex: number, name: string) => {
    update((draft) => (draft[exerciseIndex].name = name));
    setOpenExercise(exerciseIndex);
    setActiveSuggestion(0);
  };

  const selectExercise = (exerciseIndex: number, selected: Exercise) => {
    setOpenExercise(null);

    update((draft) => {
      const exercise = draft[exerciseIndex];
      const changedExercise =
        exercise.name.trim().toLowerCase() !== selected.name.toLowerCase();

      exercise.name = selected.name;
      if (selected.lastSet && (!editing || changedExercise)) {
        exercise.sets = [{
          reps: String(selected.lastSet.reps),
          weight: String(selected.lastSet.weight),
          rpe: "",
          isWarmup: false,
        }];
      }
    });
  };

  const handleExerciseKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    exerciseIndex: number,
    suggestions: Exercise[]
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpenExercise(exerciseIndex);
      if (suggestions.length > 0) {
        setActiveSuggestion((current) =>
          openExercise === exerciseIndex ? Math.min(current + 1, suggestions.length - 1) : 0
        );
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpenExercise(exerciseIndex);
      setActiveSuggestion((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && openExercise === exerciseIndex && suggestions[activeSuggestion]) {
      event.preventDefault();
      selectExercise(exerciseIndex, suggestions[activeSuggestion]);
    } else if (event.key === "Escape" || event.key === "Tab") {
      setOpenExercise(null);
    }
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

      {exercises.map((ex, ei) => {
        const previousSet = knownExercise(ex.name)?.lastSet;
        const suggestions = exerciseSuggestions(ex.name);
        const suggestionsOpen = openExercise === ei;
        const listboxId = `exercise-suggestions-${ei}`;

        return <div key={ei} className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1" data-exercise-picker={ei}>
              <input
                className="input w-full pr-10"
                role="combobox"
                aria-autocomplete="list"
                aria-label="Exercise name"
                aria-expanded={suggestionsOpen}
                aria-controls={listboxId}
                aria-activedescendant={
                  suggestionsOpen && suggestions[activeSuggestion]
                    ? `${listboxId}-${suggestions[activeSuggestion].id}`
                    : undefined
                }
                autoComplete="off"
                placeholder="Exercise (e.g. Bench Press)"
                value={ex.name}
                onFocus={() => {
                  setOpenExercise(ei);
                  setActiveSuggestion(0);
                }}
                onChange={(e) => changeExerciseName(ei, e.target.value)}
                onKeyDown={(e) => handleExerciseKeyDown(e, ei, suggestions)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-white/50 hover:text-white"
                aria-label={suggestionsOpen ? "Close exercise suggestions" : "Show previous exercises"}
                onClick={(event) => {
                  if (suggestionsOpen) {
                    setOpenExercise(null);
                  } else {
                    setOpenExercise(ei);
                    setActiveSuggestion(0);
                    (event.currentTarget.previousElementSibling as HTMLInputElement)?.focus();
                  }
                }}
              >
                <ChevronDown className={`transition-transform ${suggestionsOpen ? "rotate-180" : ""}`} />
              </button>

              {suggestionsOpen && (
                <div
                  id={listboxId}
                  role="listbox"
                  className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto overscroll-contain rounded-xl border border-white/15 bg-slate-900 p-1 shadow-2xl"
                >
                  {suggestions.length > 0 ? suggestions.map((suggestion, suggestionIndex) => (
                    <button
                      id={`${listboxId}-${suggestion.id}`}
                      key={suggestion.id}
                      type="button"
                      role="option"
                      aria-selected={suggestionIndex === activeSuggestion}
                      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left ${
                        suggestionIndex === activeSuggestion ? "bg-emerald-500/20 text-white" : "text-white/80 hover:bg-white/10"
                      }`}
                      onMouseEnter={() => setActiveSuggestion(suggestionIndex)}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        selectExercise(ei, suggestion);
                      }}
                      onClick={(event) => {
                        if (event.detail === 0) selectExercise(ei, suggestion);
                      }}
                    >
                      <span className="font-medium">{suggestion.name}</span>
                      {suggestion.lastSet && (
                        <span className="shrink-0 text-xs text-white/45">
                          {suggestion.lastSet.reps} reps · {suggestion.lastSet.weight} kg
                        </span>
                      )}
                    </button>
                  )) : (
                    <p className="px-3 py-3 text-sm text-white/50">
                      No previous exercise matches. Keep typing to add a new one.
                    </p>
                  )}
                </div>
              )}
            </div>
            {exercises.length > 1 && (
              <button className="btn-ghost px-2" title="Remove exercise" onClick={() => {
                setOpenExercise(null);
                update((d) => d.splice(ei, 1));
              }}>
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
        onClick={() => {
          setOpenExercise(null);
          setExercises((p) => [...p, emptyExercise()]);
        }}>
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
