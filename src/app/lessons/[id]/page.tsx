"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import LessonView from "@/components/lesson/LessonView";
import { isSoon } from "@/lib/lessons";
import { useAppData } from "@/lib/use-app-data";

function Lesson() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, toggleDone } = useAppData(false);
  const doc = data?.docs.find((d) => String(d.id) === id);

  useEffect(() => {
    if (data && (!doc || isSoon(doc))) router.replace("/learn"); // unknown or coming-soon lesson
  }, [data, doc, router]);

  if (!data || !doc || isSoon(doc)) return <main className="p-8 text-slate-500">Loading…</main>;

  return (
    <>
      <AppHeader active="/learn" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <LessonView doc={doc} docs={data.docs} me={data.me} onToggle={toggleDone} />
      </main>
    </>
  );
}


export default function LessonPage() {
  return (
    <Suspense fallback={<main className="p-8 text-slate-500">Loading…</main>}>
      <Lesson />
    </Suspense>
  );
}