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

## Next — user action

- [ ] **Activate CI** — `.github/workflows/ci.yml` exists locally but the push
      may be rejected (token lacks `workflow` scope). Run:
      `gh auth refresh -s workflow && git add .github && git commit -m "Add CI" && git push`.

## Later

- [ ] Multi-user auth (the v1 was intentionally single-user).
- [ ] Edit individual sets after saving (currently delete + re-log).
- [ ] Routine templates; rest timer; PR notifications.
- [ ] CSV export; PWA / installable; live deploy.
- [ ] Polish: leftmost chart x-axis label can clip — anchor first/last labels.
