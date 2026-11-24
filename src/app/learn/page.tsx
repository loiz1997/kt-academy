"use client";

import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { getLesson } from "@/lib/lesson-content";
import { isSoon } from "@/lib/lessons";
import { useAppData } from "@/lib/use-app-data";

const CAT = { Local: ["💻", "text-indigo-600"], TestOps: ["☁️", "text-teal-600"], Tools: ["🧰", "text-amber-600"] } as const;

export default function LearnPage() {
  const { data } = useAppData(false);
  if (!data) return <main className="p-8 text-slate-500">Loading…</main>;
  const { me, docs } = data;

  return (
    <>
      <AppHeader active="/learn" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <h1 className="text-2xl font-extrabold text-slate-900" data-testid="learn-title">KT lessons</h1>
        <p className="mb-4 text-slate-500">Short, step-by-step lessons. Open one and follow along.</p>
        <Link href="/paths" data-testid="learn-paths-link" className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-indigo-200 bg-gradient-to-r from-indigo-50 to-teal-50 p-4 shadow-sm">
          <span>
            <b className="block text-slate-900">🏅 Certification paths</b>
            <span className="text-sm text-slate-600">See what you need to do for each Katalon certification, step by step.</span>
          </span>
          <span className="bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white">View paths ›</span>
        </Link>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Link href="/videos" data-testid="learn-videos-link" className="flex items-center gap-3 border border-slate-200 bg-white p-4 shadow-md hover:shadow-lg">
            <span className="text-3xl" aria-hidden="true">🎬</span>
            <span className="min-w-0 flex-1"><b className="block text-slate-900">Video tutorials</b><span className="text-sm text-slate-500">{me.role === "admin" ? "Add and manage short walkthroughs." : "Short walkthroughs you can watch at your own pace."}</span></span>
            <span className="font-semibold text-indigo-600">›</span>
          </Link>
          <Link href="/documents" data-testid="learn-documents-link" className="flex items-center gap-3 border border-slate-200 bg-white p-4 shadow-md hover:shadow-lg">
            <span className="text-3xl" aria-hidden="true">📎</span>
            <span className="min-w-0 flex-1"><b className="block text-slate-900">KT documents</b><span className="text-sm text-slate-500">{me.role === "admin" ? "Add and manage shared guides and files." : "Guides and files shared by your KT lead."}</span></span>
            <span className="font-semibold text-indigo-600">›</span>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d, i) => {
            const soon = isSoon(d);
            const ok = me.done.includes(d.id);
            const [icon, color] = CAT[d.c] ?? CAT.Tools;
            const card = (
              <div className={`flex h-full flex-col border border-slate-200 bg-white p-4 shadow-md ${soon ? "opacity-60" : "hover:border-indigo-300 hover:shadow-lg"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${color}`}>{icon} {d.c}</span>
                  <span className="text-sm text-slate-400">Lesson {i + 1}</span>
                </div>
                <h2 className="mt-2 text-base font-bold text-slate-900">{d.t}</h2>
                <p className="mt-1 line-clamp-3 text-sm text-slate-500">{soon ? "This lesson is still in development." : d.b}</p>
                <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                  <span className="text-slate-500">{!soon && getLesson(d) ? "📷 Step-by-step with screenshots" : ""}</span>
                  {soon ? <b className="text-slate-400">Coming soon</b> : ok ? <b className="text-emerald-600" data-testid={`lesson-done-badge-${i + 1}`}>✓ Done</b> : <b className="text-indigo-600">{d.l}</b>}
                </div>
              </div>
            );
            return soon ? (
              <div key={d.id} data-testid={`lesson-card-${i + 1}`} aria-disabled="true">{card}</div>
            ) : (
              <Link key={d.id} href={`/lessons/${d.id}`} data-testid={`lesson-card-${i + 1}`}>{card}</Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
