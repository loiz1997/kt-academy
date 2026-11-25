import type { SupabaseClient } from "@supabase/supabase-js";
import { fixDocs } from "./lessons";
import type { Doc, Learner, Profile } from "./types";
import { store } from "./session-cache";

export type DashboardData = { me: Profile; docs: Doc[]; learners: Learner[] };

// The last loaded data (if any), so a page can paint at once while the fresh copy loads.
export const peekDashboard = (withLearners: boolean): DashboardData | null =>
  store.dash && (!withLearners || store.dash.withLearners) ? store.dash : null;
export const putDashboard = (d: DashboardData) => {
  store.dash = { ...d, withLearners: store.dash?.withLearners ?? false };
};

// Loads everything the trainee dashboard needs. Returns null when nobody is logged in.
export async function loadDashboard(supabase: SupabaseClient, withLearners = true): Promise<DashboardData | null> {
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return null;
  const uid = s.session.user.id;

  const [p, d, l] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).single(),
    supabase.from("docs").select("*").order("id"),
    withLearners ? supabase.rpc("top_learners") : Promise.resolve({ data: [] }), // names, progress and scores only, no emails
  ]);
  if (!p.data) return null;

  const prev = store.dash;
  const fresh: DashboardData = {
    me: p.data as Profile,
    docs: fixDocs((d.data ?? []) as Doc[]),
    learners: withLearners ? (Array.isArray(l.data) ? (l.data as Learner[]) : []) : prev?.learners ?? [],
  };
  store.dash = { ...fresh, withLearners: withLearners || !!prev?.withLearners };
  return fresh;
}
