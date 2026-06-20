import type { Exercise, Progress, SessionFull, SessionListItem, Summary } from "./types";

const BASE = `${(import.meta.env.VITE_API_URL as string) || "http://localhost:4000"}/api/v1`;

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
  sessions: () => req<SessionListItem[]>("/sessions"),
  session: (id: string) => req<SessionFull>(`/sessions/${id}`),
  createSession: (body: unknown) =>
    req<SessionFull>("/sessions", { method: "POST", body: JSON.stringify(body) }),
  deleteSession: (id: string) => req<{ ok: true }>(`/sessions/${id}`, { method: "DELETE" }),
  progress: (exerciseId: string) => req<Progress>(`/analytics/progress/${exerciseId}`),
};
