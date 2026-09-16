import type { Exercise, Progress, SessionFull, SessionListItem, Summary, WorkoutTag } from "./types";

const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const apiOrigin =
  configuredApiUrl === undefined
    ? "http://localhost:4000"
    : configuredApiUrl.replace(/\/$/, "");
const BASE = `${apiOrigin}/api/v1`;

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  summary: () => req<Summary>("/analytics/summary"),
  exercises: () => req<Exercise[]>("/exercises"),
  tags: () => req<WorkoutTag[]>("/tags"),
  sessions: () => req<SessionListItem[]>("/sessions"),
  session: (id: string) => req<SessionFull>(`/sessions/${id}`),
  createSession: (body: unknown) =>
    req<SessionFull>("/sessions", { method: "POST", body: JSON.stringify(body) }),
  updateSession: (id: string, body: unknown) =>
    req<SessionFull>(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSession: (id: string) => req<{ ok: true }>(`/sessions/${id}`, { method: "DELETE" }),
  progress: (exerciseId: string) => req<Progress>(`/analytics/progress/${exerciseId}`),
};
