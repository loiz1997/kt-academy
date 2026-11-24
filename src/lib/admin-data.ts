"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase/client";
import { loadDashboard } from "./dashboard-data";
import type { Submission } from "./submissions";
import type { Doc, Profile } from "./types";

export type AdminSub = Submission & { lesson_title?: string | null; reviewed_at?: string | null; reviewed_by?: string | null };
export type AdminData = { me: Profile; docs: Doc[]; users: Profile[]; subs: AdminSub[] };

// Total score of a trainee = sum of the scores of their approved submissions.
export const scoreFromSubs = (uid: string, subs: AdminSub[]) =>
  subs.filter((s) => String(s.user_id) === String(uid) && s.status === "approved").reduce((a, s) => a + (Number(s.score) || 0), 0);

export const trainees = (users: Profile[]) => users.filter((u) => u.role === "user");

// Loads everything the admin pages need. Non-admins are sent back to their own dashboard.
export function useAdminData() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);

  const load = useCallback(async () => {
    const sb = createClient();
    const d = await loadDashboard(sb, false);
    if (!d) return router.replace("/login");
    if (d.me.role !== "admin") return router.replace("/dashboard");
    const [p, s] = await Promise.all([
      sb.from("profiles").select("*").order("name"),
      sb.from("submissions").select("*").order("created_at", { ascending: false }),
    ]);
    setData({ me: d.me, docs: d.docs, users: (p.data ?? []) as Profile[], subs: (s.data ?? []) as AdminSub[] });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // Approve or send back a submission. Returns an error text, or "" when it worked.
  const review = useCallback(
    async (id: string, status: "approved" | "revise", score: number | null, feedback: string) => {
      if (!data) return "Not loaded yet.";
      const rec = { status, feedback, score, reviewed_at: new Date().toISOString(), reviewed_by: data.me.name };
      const { error } = await createClient().from("submissions").update(rec).eq("id", id);
      if (error) return /score|schema cache/i.test(error.message) ? "The score column is not ready yet. Run supabase-fix-submissions.sql in Supabase, wait a few seconds, then reload. (" + error.message + ")" : "Could not save: " + error.message;
      setData({ ...data, subs: data.subs.map((s) => (String(s.id) === String(id) ? { ...s, ...rec } : s)) });
      return "";
    },
    [data]
  );

  return { data, review, reload: load };
}
