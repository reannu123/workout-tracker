# Workout Tracker — TODO

Status: **flagship build complete** (verified end-to-end 2026-06-20).
Central direction lives in `~/Freelance/NOW.md`; this file tracks the build.
Spec source: `~/Freelance/Archive/Freelance-OS/Projects/01-Workout-Tracker`.

## Done

- [x] Monorepo scaffold: docker-compose, server/client Dockerfiles, nginx SPA,
      Prisma schema, Vite/TS/Tailwind config, env example.
- [x] Data model: Exercise / WorkoutSession / SessionExercise / Set (free-form
      exercise entry reused by name) + Prisma migration.
- [x] API (`/api/v1`): sessions (composite create in a transaction, list,
      detail, delete), exercises (list/create), analytics (summary, progress).
- [x] Pure analytics module (volume, Epley 1RM, streaks, progress) + `node:test`
      unit tests (6 passing).
- [x] Client: Dashboard (KPIs + volume chart), Log (fast logger), History,
      Session detail, Progress (per-exercise 1RM trend + PRs). Hand-rolled SVG
      charts, no chart dependency.
- [x] Idempotent seed: ~5 weeks of progressive-overload demo workouts.
- [x] Verified: `docker compose up --build` runs the full stack; log→history→
      progress works end-to-end; client builds clean; screenshots captured.
- [x] README, case study, MIT license.
- [x] Public demo deployed 2026-07-01 at `https://workout.reannu.dev`: GHCR
      client/server images, pm-docker port `3025`, persisted Postgres volume,
      NPM proxy host `id=32`, local/public `/api/health` 200, public homepage
      200, analytics API 200, and browser smoke rendered dashboard data.

## Next — user action

- [x] **CI activated** — `.github/workflows/ci.yml` pushed in `d74f24c` on
      2026-06-24; first GitHub Actions CI run passed.
- [x] **Deployment workflow activated** — commit `d66da93`; CI run
      `28464304022` passed and Docker Image CD run `28464304012` published
      the GHCR client/server images.

## Later

- [ ] Multi-user auth (the v1 was intentionally single-user).
- [ ] Edit individual sets after saving (currently delete + re-log).
- [ ] Routine templates; rest timer; PR notifications.
- [ ] CSV export; PWA / installable.
- [ ] Polish: leftmost chart x-axis label can clip — anchor first/last labels.
