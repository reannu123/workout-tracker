import { Router } from "express";
import { prisma } from "../db.js";
import { summarize, exerciseProgress } from "../lib/analytics.js";

const router = Router();

// GET /analytics/summary — dashboard totals + recent volume trend.
router.get("/summary", async (_req, res) => {
  const sessions = await prisma.workoutSession.findMany({
    orderBy: { performedAt: "asc" },
    select: {
      performedAt: true,
      durationMin: true,
      exercises: { select: { sets: { select: { reps: true, weight: true, isWarmup: true } } } },
    },
  });
  res.json(summarize(sessions));
});

// GET /analytics/progress/:exerciseId — per-session progress for one exercise.
router.get("/progress/:exerciseId", async (req, res) => {
  const exercise = await prisma.exercise.findUnique({ where: { id: req.params.exerciseId } });
  if (!exercise) return res.status(404).json({ error: "Exercise not found." });

  const rows = await prisma.sessionExercise.findMany({
    where: { exerciseId: exercise.id },
    include: {
      session: { select: { performedAt: true } },
      sets: { select: { reps: true, weight: true, isWarmup: true } },
    },
  });

  const entries = rows.map((r) => ({ performedAt: r.session.performedAt, sets: r.sets }));
  res.json({ exercise: { id: exercise.id, name: exercise.name }, ...exerciseProgress(entries) });
});

export default router;
