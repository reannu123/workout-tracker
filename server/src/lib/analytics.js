// Pure, DB-free workout analytics. Operates on plain objects so it is easy to
// unit-test. Routes shape Prisma results into these inputs.

const DAY_MS = 86_400_000;

/** Estimated one-rep max (Epley). 1 rep => the lifted weight itself. */
export function epley1RM(weight, reps) {
  if (!weight || reps <= 0) return 0;
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

/** Working volume of a set (warmups don't count). */
export function setVolume(set) {
  return set.isWarmup ? 0 : (set.reps || 0) * (set.weight || 0);
}

/** Stats for one session: { exercises: [{ sets: [...] }] }. */
export function sessionStats(session) {
  let totalVolume = 0;
  let totalSets = 0;
  let workingSets = 0;
  let topWeight = 0;
  for (const se of session.exercises || []) {
    for (const s of se.sets || []) {
      totalSets += 1;
      if (!s.isWarmup) {
        workingSets += 1;
        totalVolume += setVolume(s);
      }
      if ((s.weight || 0) > topWeight) topWeight = s.weight || 0;
    }
  }
  return {
    totalVolume,
    totalSets,
    workingSets,
    exerciseCount: (session.exercises || []).length,
    topWeight,
  };
}

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

/**
 * Consecutive-day workout streak ending today or yesterday.
 * @param dates array of session dates
 * @param now reference time (injectable for tests)
 */
export function currentStreak(dates, now = Date.now()) {
  const days = new Set(dates.map(dayKey));
  if (days.size === 0) return 0;
  const today = dayKey(now);
  const yesterday = dayKey(now - DAY_MS);
  // Streak only counts if you worked out today or yesterday.
  let cursor = days.has(today) ? now : days.has(yesterday) ? now - DAY_MS : null;
  if (cursor === null) return 0;
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

/** Dashboard summary across all sessions. */
export function summarize(sessions, now = Date.now()) {
  let totalVolume = 0;
  let totalSets = 0;
  let durationSum = 0;
  let durationCount = 0;
  let last30 = 0;
  const days = new Set();
  const recent = [];

  for (const s of sessions) {
    const st = sessionStats(s);
    totalVolume += st.totalVolume;
    totalSets += st.totalSets;
    days.add(dayKey(s.performedAt));
    if (s.durationMin != null) {
      durationSum += s.durationMin;
      durationCount += 1;
    }
    if (now - new Date(s.performedAt).getTime() <= 30 * DAY_MS) last30 += 1;
    recent.push({ date: dayKey(s.performedAt), volume: st.totalVolume });
  }

  recent.sort((a, b) => (a.date < b.date ? -1 : 1));

  return {
    totalSessions: sessions.length,
    totalVolume,
    totalSets,
    workoutDays: days.size,
    last30Sessions: last30,
    currentStreak: currentStreak(sessions.map((s) => s.performedAt), now),
    avgDurationMin: durationCount ? Math.round(durationSum / durationCount) : null,
    volumeTrend: recent.slice(-12), // last 12 sessions for the chart
  };
}

/**
 * Per-session progress for one exercise.
 * @param entries [{ performedAt, sets: [{ reps, weight, isWarmup }] }]
 */
export function exerciseProgress(entries) {
  const points = entries
    .map((e) => {
      let maxWeight = 0;
      let volume = 0;
      let best1RM = 0;
      let topReps = 0;
      for (const s of e.sets || []) {
        if (s.isWarmup) continue;
        volume += (s.reps || 0) * (s.weight || 0);
        if ((s.weight || 0) > maxWeight) {
          maxWeight = s.weight || 0;
          topReps = s.reps || 0;
        }
        const e1 = epley1RM(s.weight, s.reps);
        if (e1 > best1RM) best1RM = e1;
      }
      return { date: dayKey(e.performedAt), maxWeight, volume, est1RM: Math.round(best1RM), topReps };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const pr = {
    maxWeight: points.reduce((m, p) => Math.max(m, p.maxWeight), 0),
    bestEst1RM: points.reduce((m, p) => Math.max(m, p.est1RM), 0),
  };
  return { points, pr };
}
