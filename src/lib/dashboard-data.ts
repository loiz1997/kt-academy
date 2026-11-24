import type { SupabaseClient } from "@supabase/supabase-js";
import { fixDocs } from "./lessons";
import type { Doc, Learner, Profile } from "./types";

export type DashboardData = { me: Profile; docs: Doc[]; learners: Learner[] };

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

  return {
    me: p.data as Profile,
    docs: fixDocs((d.data ?? []) as Doc[]),
    learners: Array.isArray(l.data) ? (l.data as Learner[]) : [],
  };
}
