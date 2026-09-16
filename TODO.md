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
- [x] [Dev] Saved workout editing: session detail links to a prefilled editor;
      duration, notes, exercises, sets, RPE, and warmup flags update through an
      atomic API transaction. Verified with server tests, a client build, and a
      Docker API create-update-read-delete smoke check.
- [x] [DevOps] Workout editor release deployed 2026-09-11 from commit `e9dd7c7`:
      CI run `34531885343` and GHCR run `34531885394` passed; immutable client
      and server images are healthy on pm-docker; local/public home and health
      checks returned 200; NPM proxy host `id=32` remained unchanged; live
      browser smoke verified the prefilled editor and Add exercise action.
- [x] [Dev] Progress exercise selector hides exercises with zero recorded
      workouts. Verified 2026-09-16 with a clean production client build.
- [x] [Dev] Workout logger suggests previously used exercises and autofills the
      selected exercise with the reps and weight from its most recent set.
      Verified 2026-09-16 with a production client build, six server tests,
      Prisma validation, a Compose/API smoke check, and a browser interaction
      that selected Bench Press and filled 5 reps at 70 kg.
- [x] [Dev] Replaced the native workout `datalist` with a touch-friendly custom
      exercise picker so previous-workout suggestions appear on mobile.
      Verified 2026-09-16 with a production client build and 390×844 touch
      emulation covering open, filter, selection/autofill, outside close, 48px
      touch targets, and keyboard selection.
- [x] [Dev] Exercise suggestions allow vertical swipe scrolling without
      selecting an item on touch-down. Verified locally 2026-09-16 at 390×844:
      a real touch gesture moved the list from 0 to 234px, kept the picker open,
      and a subsequent tap selected Pull Up and autofilled 6 reps at 0 kg.
- [x] [DevOps] Swipeable exercise picker release deployed 2026-09-16 from
      commit `93d3417`: CI run `35079569568` and GHCR run `35079569495`
      passed; immutable client/server images are healthy on pm-docker;
      PostgreSQL was backed up and retained 3 sessions, 17 exercises, and 50
      sets; NPM proxy host `id=32` remained unchanged; internal/LAN home and
      health checks returned 200; a live 390×844 touch gesture scrolled the
      picker from 0 to 218px without selection, then a tap selected Row Machine
      and filled 12 reps at 25 kg. The public edge retained its Cloudflare
      Basic-auth 401.
- [x] [DevOps] Mobile exercise picker release deployed 2026-09-16 from commit
      `b21f7eb`: CI run `35078562622` and GHCR run `35078562623` passed;
      immutable client/server images are healthy on pm-docker; PostgreSQL was
      backed up and retained 3 sessions, 17 exercises, and 50 sets; NPM proxy
      host `id=32` matched `workout.reannu.dev` at `192.168.0.125:3025`;
      internal/LAN home and health checks returned 200; a live 390×844 touch
      smoke showed 9 suggestions and filled 10 reps at 45 kg. The public edge
      returned its pre-existing Cloudflare Basic-auth 401.
- [x] [DevOps] Workout suggestion release deployed 2026-09-16 from commit
      `618edd3`: CI run `35076610840` and GHCR run `35076610810` passed;
      immutable client/server images are healthy on pm-docker; PostgreSQL was
      backed up and retained 3 sessions, 17 exercises, and 50 sets; NPM proxy
      host `id=32` and both existing domains were preserved; internal/public
      home and health checks returned 200; live browser selection filled the
      latest 10 reps at 45 kg for Bench Press Machine.
- [x] [DevOps] Progress filter release deployed 2026-09-16 from commit
      `cf54beb`: CI run `35071533385` and GHCR run `35071533424` passed;
      immutable client/server images are healthy on pm-docker; PostgreSQL was
      backed up and remained unchanged; local/public health and Progress checks
      returned 200; NPM proxy host `id=32` remained unchanged; live browser
      rendering showed only the nine exercises with recorded workouts.

## Next — user action

- [x] **CI activated** — `.github/workflows/ci.yml` pushed in `d74f24c` on
      2026-06-24; first GitHub Actions CI run passed.
- [x] **Deployment workflow activated** — commit `d66da93`; CI run
      `28464304022` passed and Docker Image CD run `28464304012` published
      the GHCR client/server images.

## Later

- [ ] Multi-user auth (the v1 was intentionally single-user).
- [ ] Routine templates; rest timer; PR notifications.
- [ ] CSV export; PWA / installable.
- [ ] Polish: leftmost chart x-axis label can clip — anchor first/last labels.
