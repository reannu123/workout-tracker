import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /exercises — all known exercises with usage and their most recent set.
router.get("/", async (_req, res) => {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { sessionExercises: true } },
      sessionExercises: {
        orderBy: [
          { session: { performedAt: "desc" } },
          { createdAt: "desc" },
        ],
        take: 1,
        include: {
          session: { select: { performedAt: true } },
          sets: { orderBy: { setNumber: "desc" }, take: 1 },
        },
      },
    },
  });
  res.json(
    exercises.map((e) => {
      const latestExercise = e.sessionExercises[0];
      const latestSet = latestExercise?.sets[0];

      return {
        id: e.id,
        name: e.name,
        usedCount: e._count.sessionExercises,
        lastSet: latestSet
          ? {
              reps: latestSet.reps,
              weight: latestSet.weight,
              performedAt: latestExercise.session.performedAt,
            }
          : null,
      };
    })
  );
});

// POST /exercises — create one explicitly (logging also auto-creates by name).
router.post("/", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Name is required." });
  try {
    const exercise = await prisma.exercise.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    res.status(201).json(exercise);
  } catch {
    res.status(400).json({ error: "Could not create exercise." });
  }
});

export default router;
