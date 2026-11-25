"use client";

import PageLoading from "@/components/PageLoading";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loadDashboard, peekDashboard, type DashboardData } from "@/lib/dashboard-data";
import AppHeader from "@/components/AppHeader";
import Hero from "@/components/dashboard/Hero";
import Top5 from "@/components/dashboard/Top5";
import Overview from "@/components/dashboard/Overview";
import Journey from "@/components/dashboard/Journey";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(() => peekDashboard(true));

  useEffect(() => {
    (async () => {
      const d = await loadDashboard(createClient());
      if (!d) return router.replace("/login"); // not logged in
      setData(d);
    })();
  }, [router]);

  if (!data) return <PageLoading />;

  const { me, docs, learners } = data;
  const myScore = Number(learners.find((l) => l.id === me.id)?.score) || 0;

  return (
    <>
      <AppHeader active="/dashboard" />
      <main data-testid="dashboard-main-1" className="mx-auto max-w-5xl px-4 py-5">
        <Hero me={me} docs={docs} score={myScore} />
        <Top5 learners={learners} docs={docs} meId={me.id} myScore={myScore} />
        <Overview me={me} docs={docs} />
        <Journey me={me} docs={docs} />
      </main>
    </>
  );
}
