"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loadDashboard, type DashboardData } from "@/lib/dashboard-data";
import AppHeader from "@/components/AppHeader";
import Hero from "@/components/dashboard/Hero";
import Top5 from "@/components/dashboard/Top5";
import Overview from "@/components/dashboard/Overview";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    (async () => {
      const d = await loadDashboard(createClient());
      if (!d) return router.replace("/login"); // not logged in
      setData(d);
    })();
  }, [router]);

  if (!data) return <main className="p-8 text-slate-500">Loading…</main>;

  const { me, docs, learners } = data;
  const myScore = Number(learners.find((l) => l.id === me.id)?.score) || 0;

  return (
    <>
      <AppHeader active="/dashboard" />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-5">
        <Hero me={me} docs={docs} score={myScore} />
        <Top5 learners={learners} docs={docs} meId={me.id} myScore={myScore} />
        <Overview me={me} docs={docs} />
      </main>
    </>
  );
}
