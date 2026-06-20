import test from "node:test";
import assert from "node:assert/strict";
import {
  epley1RM,
  setVolume,
  sessionStats,
  currentStreak,
  summarize,
  exerciseProgress,
} from "../src/lib/analytics.js";

const DAY = 86_400_000;

test("epley1RM: 1 rep is the weight itself; more reps estimate higher", () => {
  assert.equal(epley1RM(100, 1), 100);
  assert.ok(epley1RM(100, 5) > 100);
  assert.equal(epley1RM(0, 5), 0);
  assert.equal(epley1RM(100, 0), 0);
});

test("setVolume: warmups don't count", () => {
  assert.equal(setVolume({ reps: 10, weight: 50 }), 500);
  assert.equal(setVolume({ reps: 10, weight: 50, isWarmup: true }), 0);
});

test("sessionStats sums working volume and counts sets", () => {
  const s = {
    exercises: [
      { sets: [{ reps: 10, weight: 50, isWarmup: true }, { reps: 10, weight: 60 }, { reps: 8, weight: 60 }] },
      { sets: [{ reps: 5, weight: 100 }] },
    ],
  };
  const st = sessionStats(s);
  assert.equal(st.totalSets, 4);
  assert.equal(st.workingSets, 3);
  assert.equal(st.totalVolume, 10 * 60 + 8 * 60 + 5 * 100); // 1580, warmup excluded
  assert.equal(st.exerciseCount, 2);
  assert.equal(st.topWeight, 100);
});

test("currentStreak counts consecutive days ending today/yesterday", () => {
  const now = Date.parse("2026-06-20T12:00:00Z");
  const dates = [now, now - DAY, now - 2 * DAY, now - 5 * DAY];
  assert.equal(currentStreak(dates, now), 3);
  // worked out yesterday but not today -> streak still counts from yesterday
  assert.equal(currentStreak([now - DAY, now - 2 * DAY], now), 2);
  // last workout 3 days ago -> broken streak
  assert.equal(currentStreak([now - 3 * DAY], now), 0);
  assert.equal(currentStreak([], now), 0);
});

test("summarize aggregates totals and trend", () => {
  const now = Date.parse("2026-06-20T12:00:00Z");
  const mk = (perfAt, vol) => ({ performedAt: perfAt, durationMin: 60, exercises: [{ sets: [{ reps: vol / 10, weight: 10 }] }] });
  const s = summarize([mk(now, 100), mk(now - DAY, 200)], now);
  assert.equal(s.totalSessions, 2);
  assert.equal(s.totalVolume, 300);
  assert.equal(s.workoutDays, 2);
  assert.equal(s.avgDurationMin, 60);
  assert.equal(s.volumeTrend.length, 2);
  assert.ok(s.volumeTrend[0].date <= s.volumeTrend[1].date); // ascending
});

test("exerciseProgress builds ascending points + PRs", () => {
  const now = Date.parse("2026-06-20T12:00:00Z");
  const { points, pr } = exerciseProgress([
    { performedAt: now, sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 100, isWarmup: true }] },
    { performedAt: now - DAY, sets: [{ reps: 8, weight: 80 }] },
  ]);
  assert.equal(points.length, 2);
  assert.ok(points[0].date < points[1].date); // sorted ascending
  assert.equal(pr.maxWeight, 100);
  assert.ok(pr.bestEst1RM >= 100);
});
