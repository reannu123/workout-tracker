// Idempotent seed: a few weeks of realistic, progressively-heavier workouts so
// the dashboard and progress charts are populated on first boot. Skips if any
// sessions already exist.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 86_400_000;

// A simple 3-day split. Weights climb a little each week (progressive overload).
const TEMPLATE = {
  Push: [
    { name: "Bench Press", base: 60, step: 2.5, reps: [8, 8, 6], warmup: true },
    { name: "Overhead Press", base: 35, step: 1.25, reps: [10, 9, 8] },
    { name: "Triceps Pushdown", base: 25, step: 1.0, reps: [12, 12, 10] },
  ],
  Pull: [
    { name: "Deadlift", base: 100, step: 5, reps: [5, 5, 3], warmup: true },
    { name: "Barbell Row", base: 55, step: 2.5, reps: [10, 9, 8] },
    { name: "Pull Up", base: 0, step: 0, reps: [9, 8, 6] },
  ],
  Legs: [
    { name: "Squat", base: 80, step: 5, reps: [8, 8, 5], warmup: true },
    { name: "Leg Press", base: 140, step: 5, reps: [12, 12, 10] },
    { name: "Leg Curl", base: 35, step: 1.25, reps: [12, 12, 12] },
  ],
};
const ROTATION = ["Push", "Pull", "Legs"];

async function main() {
  const existing = await prisma.workoutSession.count();
  if (existing > 0) {
    console.log(`Seed skipped: ${existing} sessions already present.`);
    return;
  }

  const now = Date.now();
  const SESSIONS = 15; // ~5 weeks at 3x/week
  for (let i = SESSIONS - 1; i >= 0; i--) {
    const week = Math.floor((SESSIONS - 1 - i) / 3);
    const day = ROTATION[(SESSIONS - 1 - i) % 3];
    const performedAt = new Date(now - i * 2 * DAY); // every ~2 days
    const exercises = TEMPLATE[day];

    const session = await prisma.workoutSession.create({
      data: {
        performedAt,
        durationMin: 50 + ((i * 7) % 25),
        notes: i === 0 ? "Felt strong today 💪" : null,
      },
    });

    for (let xi = 0; xi < exercises.length; xi++) {
      const x = exercises[xi];
      const exercise = await prisma.exercise.upsert({
        where: { name: x.name },
        update: {},
        create: { name: x.name },
      });
      const se = await prisma.sessionExercise.create({
        data: { sessionId: session.id, exerciseId: exercise.id, orderIndex: xi },
      });
      const working = x.base + x.step * week;
      let setNumber = 1;
      if (x.warmup && working > 0) {
        await prisma.set.create({
          data: { sessionExerciseId: se.id, setNumber: setNumber++, reps: 10, weight: Math.round(working * 0.5), isWarmup: true },
        });
      }
      for (const reps of x.reps) {
        await prisma.set.create({
          data: {
            sessionExerciseId: se.id,
            setNumber: setNumber++,
            reps,
            weight: working,
            rpe: 7 + (10 - reps) / 5,
          },
        });
      }
    }
  }
  console.log(`Seed complete: ${SESSIONS} sessions across Push/Pull/Legs.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
