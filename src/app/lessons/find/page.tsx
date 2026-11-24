"use client";

import PageLoading from "@/components/PageLoading";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppData } from "@/lib/use-app-data";

// Links inside lessons point here, for example /lessons/find?t=Katalon%20Studio.
// It finds the lesson whose title starts with that text and opens it.
function Finder() {
  const t = useSearchParams().get("t") ?? "";
  const router = useRouter();
  const { data } = useAppData(false);

  useEffect(() => {
    if (!data) return;
    const hit = data.docs.find((d) => d.t.startsWith(t));
    router.replace(hit ? `/lessons/${hit.id}` : "/learn");
  }, [data, t, router]);

  return <main className="p-8 text-slate-500">Opening lesson…</main>;
}

export default function FindLesson() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Finder />
    </Suspense>
  );
}
