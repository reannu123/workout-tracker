export type Exercise = { id: string; name: string; usedCount: number };

export type SetRow = {
  id?: string;
  setNumber: number;
  reps: number;
  weight: number;
  rpe?: number | null;
  isWarmup: boolean;
};

export type SessionExercise = {
  id: string;
  orderIndex: number;
  exercise: { id: string; name: string };
  sets: SetRow[];
};

export type SessionStats = {
  totalVolume: number;
  totalSets: number;
  workingSets: number;
  exerciseCount: number;
  topWeight: number;
};

export type SessionFull = {
  id: string;
  performedAt: string;
  notes?: string | null;
  durationMin?: number | null;
  exercises: SessionExercise[];
  stats?: SessionStats;
};

export type SessionListItem = {
  id: string;
  performedAt: string;
  notes?: string | null;
  durationMin?: number | null;
  exerciseNames: string[];
} & SessionStats;

export type Summary = {
  totalSessions: number;
  totalVolume: number;
  totalSets: number;
  workoutDays: number;
  last30Sessions: number;
  currentStreak: number;
  avgDurationMin: number | null;
  volumeTrend: { date: string; volume: number }[];
};

export type Progress = {
  exercise: { id: string; name: string };
  points: { date: string; maxWeight: number; volume: number; est1RM: number; topReps: number }[];
  pr: { maxWeight: number; bestEst1RM: number };
};

// Draft types used by the logging form before saving.
export type DraftSet = { reps: string; weight: string; isWarmup: boolean };
export type DraftExercise = { name: string; sets: DraftSet[] };
