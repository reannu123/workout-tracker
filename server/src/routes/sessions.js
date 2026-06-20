import { Router } from "express";
import { prisma } from "../db.js";
import { sessionStats } from "../lib/analytics.js";

const router = Router();

const fullInclude = {
  exercises: {
    orderBy: { orderIndex: "asc" },
    include: {
      exercise: true,
      sets: { orderBy: { setNumber: "asc" } },
    },
  },
};

function getFullSession(id) {
  return prisma.workoutSession.findUnique({ where: { id }, include: fullInclude });
}

// POST /sessions — create a whole session at once. Exercises are matched by
// name (reused if seen before, created if new) per the free-form logging spec.
router.post("/", async (req, res) => {
  const { performedAt, notes, durationMin, exercises = [] } = req.body || {};
  try {
    const session = await prisma.$transaction(async (tx) => {
      const s = await tx.workoutSession.create({
        data: {
          performedAt: performedAt ? new Date(performedAt) : new Date(),
          notes: notes?.trim() || null,
          durationMin: durationMin != null && durationMin !== "" ? Number(durationMin) : null,
        },
      });
      for (let i = 0; i < exercises.length; i++) {
        const name = String(exercises[i]?.name || "").trim();
        if (!name) continue;
        const exercise = await tx.exercise.upsert({ where: { name }, update: {}, create: { name } });
        const se = await tx.sessionExercise.create({
          data: { sessionId: s.id, exerciseId: exercise.id, orderIndex: i },
        });
        const sets = (exercises[i].sets || []).filter((st) => st && Number(st.reps) > 0);
        for (let j = 0; j < sets.length; j++) {
          const st = sets[j];
          await tx.set.create({
            data: {
              sessionExerciseId: se.id,
              setNumber: j + 1,
              reps: Number(st.reps),
              weight: Number(st.weight) || 0,
              rpe: st.rpe != null && st.rpe !== "" ? Number(st.rpe) : null,
              isWarmup: !!st.isWarmup,
            },
          });
        }
      }
      return s;
    });
    const full = await getFullSession(session.id);
    res.status(201).json({ ...full, stats: sessionStats(full) });
  } catch (e) {
    console.error("create session failed:", e);
    res.status(400).json({ error: "Could not create session." });
  }
});

// GET /sessions — list, newest first, with computed stats (not full set data).
router.get("/", async (_req, res) => {
  const sessions = await prisma.workoutSession.findMany({
    orderBy: { performedAt: "desc" },
    include: fullInclude,
  });
  res.json(
    sessions.map((s) => ({
      id: s.id,
      performedAt: s.performedAt,
      notes: s.notes,
      durationMin: s.durationMin,
      exerciseNames: s.exercises.map((se) => se.exercise.name),
      ...sessionStats(s),
    }))
  );
});

// GET /sessions/:id — full session detail.
router.get("/:id", async (req, res) => {
  const s = await getFullSession(req.params.id);
  if (!s) return res.status(404).json({ error: "Session not found." });
  res.json({ ...s, stats: sessionStats(s) });
});

// DELETE /sessions/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.workoutSession.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Session not found." });
  }
});

export default router;
