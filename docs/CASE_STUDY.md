# Case Study — Workout Tracker

**One line:** A from-scratch, self-hostable workout logger with a real progress
dashboard — built to a planning spec, shipped runnable in one command.

---

## The problem

Tracking lifts on paper or in a notes app makes the useful questions hard to
answer: *Did I press 60 or 62.5 kg last time? Is my squat actually going up? How
much volume am I doing per week?* The data is there but never aggregated.

## The goal

A personal tracker that makes **logging fast** and **progress obvious**, runs on
my own machine with no third-party services, and is clean enough to stand as a
portfolio piece. (Built from my own architecture spec — single-user, no auth,
fast logging, relational model.)

## Design

**Data model.** A workout is naturally hierarchical, so the schema mirrors it:

```
WorkoutSession ─< SessionExercise >─ Exercise
                      └─< Set
```

Exercises are entered free-form and **reused by name** — type "Bench Press" and
the API finds-or-creates the exercise, so progress for a lift accumulates across
sessions without any dropdown management.

**Analytics as pure functions.** Volume, estimated 1RM (Epley), streaks, and
per-exercise progress all live in one dependency-free module that takes plain
objects and returns plain objects. That keeps the math unit-testable in
isolation from Express and Prisma, and keeps the route handlers thin.

**One-shot session create.** Rather than a chatty per-set API, the logger builds
the whole session client-side and posts it once; the server creates the session,
reuses/creates exercises, and inserts sets inside a single transaction.

## Key decisions & trade-offs

- **Single-user, no auth (v1).** A deliberate scope cut from the spec — it keeps
  the focus on the logging/analytics experience. Multi-user auth is documented as
  the first thing to add for a shared deployment.
- **Hand-rolled SVG charts** instead of a charting library — zero extra
  dependencies, full control, and they're small. Fine for the handful of series
  this app shows.
- **Seeded demo data.** The app ships ~5 weeks of progressive-overload workouts
  so the dashboard and charts are populated the moment it boots — important for a
  portfolio demo, and skipped automatically once real data exists.

## Outcome

- `docker compose up --build` brings up Postgres + API + client; migrations and
  seed run automatically. Verified end-to-end: log a session → it appears in
  history and detail → dashboard totals and the per-exercise 1RM trend update.
- Analytics logic is unit-tested (`node:test`); the client builds clean under
  strict TypeScript.

## What this demonstrates

- **Full-stack delivery** — relational data modeling with Prisma, a thin REST
  API, a React/TypeScript front end, and a reproducible Docker deployment.
- **Clean separation** — pure, tested domain logic vs. framework glue.
- **Product sense** — fast logging, a data model that fits the domain, and a
  dashboard that answers the questions a lifter actually asks.
