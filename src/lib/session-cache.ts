import type { DashboardData } from "./dashboard-data";

// Small in-memory cache so moving between pages shows the last data at once, then refreshes it quietly.
// It lives only in the browser tab and is emptied on log out and on the login page.
export type HeaderMini = { id: string; name?: string; role: string; track: string; info: Record<string, unknown> | null };

export const store: {
  dash: (DashboardData & { withLearners: boolean }) | null;
  admin: unknown;
  mini: HeaderMini | null;
  miniAt: number;
} = { dash: null, admin: null, mini: null, miniAt: 0 };

export function clearAppCache() {
  store.dash = null;
  store.admin = null;
  store.mini = null;
  store.miniAt = 0;
}
