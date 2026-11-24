"use client";

import PageLoading from "@/components/PageLoading";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import LessonView from "@/components/lesson/LessonView";
import { isSoon } from "@/lib/lessons";
import { useAppData } from "@/lib/use-app-data";

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, toggleDone } = useAppData(false);
  const doc = data?.docs.find((d) => String(d.id) === id);

  useEffect(() => {
    if (data && (!doc || isSoon(doc))) router.replace("/learn"); // unknown or coming-soon lesson
  }, [data, doc, router]);

  if (!data || !doc || isSoon(doc)) return <PageLoading />;

  return (
    <>
      <AppHeader active="/learn" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <LessonView doc={doc} docs={data.docs} me={data.me} onToggle={toggleDone} />
      </main>
    </>
  );
}
