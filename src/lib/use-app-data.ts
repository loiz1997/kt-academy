"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase/client";
import { loadDashboard, type DashboardData } from "./dashboard-data";
import type { Profile } from "./types";

// Loads the logged-in user's profile and the lessons. Sends people to /login if nobody is logged in.
export function useAppData(withLearners = false) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    (async () => {
      const d = await loadDashboard(createClient(), withLearners);
      if (!d) return router.replace("/login");
      setData(d);
    })();
  }, [router, withLearners]);

  // Saves a lesson as done (or undone) in the database, then updates the screen.
  const toggleDone = useCallback(
    async (lessonId: number) => {
      if (!data) return false;
      const { me } = data;
      const had = me.done.includes(lessonId);
      const done = had ? me.done.filter((i) => i !== lessonId) : [...me.done, lessonId];
      const doneAt = { ...(me.info?.doneAt ?? {}) };
      if (had) delete doneAt[lessonId];
      else doneAt[lessonId] = new Date().toISOString();
      const info = { ...(me.info ?? {}), doneAt };
      const { error } = await createClient().from("profiles").update({ done, info }).eq("id", me.id);
      if (error) return false;
      setData({ ...data, me: { ...me, done, info } });
      return true;
    },
    [data]
  );

  // Saves the certificates (for example after adding or removing one).
  const saveCerts = useCallback(
    async (certs: Profile["certs"]) => {
      if (!data) return false;
      const { error } = await createClient().from("profiles").update({ certs }).eq("id", data.me.id);
      if (error) return false;
      setData({ ...data, me: { ...data.me, certs } });
      return true;
    },
    [data]
  );

  return { data, toggleDone, saveCerts };
}
