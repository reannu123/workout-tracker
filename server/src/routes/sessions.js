import { Router } from "express";
import { prisma } from "../db.js";
import { sessionStats } from "../lib/analytics.js";
import { resolveTags } from "../lib/tags.js";

const router = Router();

const fullInclude = {
  tags: { orderBy: { name: "asc" } },
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

function normalizeExercises(exercises) {
  if (!Array.isArray(exercises)) return [];

  return exercises
    .map((item) => {
      const name = String(item?.name || "").trim();
      const sets = (Array.isArray(item?.sets) ? item.sets : [])
        .filter((set) => set && Number(set.reps) > 0)
        .map((set) => ({
          reps: Number(set.reps),
          weight: Number(set.weight) || 0,
          rpe: set.rpe != null && set.rpe !== "" ? Number(set.rpe) : null,
          isWarmup: !!set.isWarmup,
        }));
      return { name, sets };
    })
    .filter((exercise) => exercise.name && exercise.sets.length > 0);
}

async function createSessionExercises(tx, sessionId, exercises) {
  for (let i = 0; i < exercises.length; i++) {
    const exerciseInput = exercises[i];
    const exercise = await tx.exercise.upsert({
      where: { name: exerciseInput.name },
      update: {},
      create: { name: exerciseInput.name },
    });
    const sessionExercise = await tx.sessionExercise.create({
      data: { sessionId, exerciseId: exercise.id, orderIndex: i },
    });

    for (let j = 0; j < exerciseInput.sets.length; j++) {
      const set = exerciseInput.sets[j];
      await tx.set.create({
        data: {
          sessionExerciseId: sessionExercise.id,
          setNumber: j + 1,
          ...set,
        },
      });
    }
  }
}

// POST /sessions — create a whole session at once. Exercises are matched by
// name (reused if seen before, created if new) per the free-form logging spec.
router.post("/", async (req, res) => {
  const { performedAt, notes, durationMin } = req.body || {};
  const exercises = normalizeExercises(req.body?.exercises);
  if (exercises.length === 0) {
    return res.status(400).json({ error: "Add at least one exercise with a set." });
  }

  try {
    const session = await prisma.$transaction(async (tx) => {
      const tags = await resolveTags(tx, req.body?.tags);
      const s = await tx.workoutSession.create({
        data: {
          performedAt: performedAt ? new Date(performedAt) : new Date(),
          notes: notes?.trim() || null,
          durationMin: durationMin != null && durationMin !== "" ? Number(durationMin) : null,
          tags: { connect: tags.map(({ id }) => ({ id })) },
        },
      });
      await createSessionExercises(tx, s.id, exercises);
      return s;
    });
    const full = await getFullSession(session.id);
    res.status(201).json({ ...full, stats: sessionStats(full) });
  } catch (e) {
    if (e.code === "TAG_VALIDATION") {
      return res.status(400).json({ error: e.message });
    }
    console.error("create session failed:", e);
    res.status(400).json({ error: "Could not create session." });
  }
});

// PUT /sessions/:id — update session details and replace its exercises/sets.
// The transaction keeps the original session intact if any nested write fails.
router.put("/:id", async (req, res) => {
  const { notes, durationMin } = req.body || {};
  const replacesTags = Object.prototype.hasOwnProperty.call(req.body || {}, "tags");
  const exercises = normalizeExercises(req.body?.exercises);
  if (exercises.length === 0) {
    return res.status(400).json({ error: "Add at least one exercise with a set." });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.workoutSession.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        const error = new Error("Session not found.");
        error.code = "SESSION_NOT_FOUND";
        throw error;
      }

      const tags = replacesTags ? await resolveTags(tx, req.body.tags) : null;
      await tx.workoutSession.update({
        where: { id: req.params.id },
        data: {
          notes: notes?.trim() || null,
          durationMin: durationMin != null && durationMin !== "" ? Number(durationMin) : null,
          ...(tags ? { tags: { set: tags.map(({ id }) => ({ id })) } } : {}),
        },
      });
      await tx.sessionExercise.deleteMany({ where: { sessionId: req.params.id } });
      await createSessionExercises(tx, req.params.id, exercises);
    });

    const full = await getFullSession(req.params.id);
    res.json({ ...full, stats: sessionStats(full) });
  } catch (e) {
    if (e.code === "SESSION_NOT_FOUND") {
      return res.status(404).json({ error: "Session not found." });
    }
    if (e.code === "TAG_VALIDATION") {
      return res.status(400).json({ error: e.message });
    }
    console.error("update session failed:", e);
    res.status(400).json({ error: "Could not update session." });
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
      tags: s.tags,
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
