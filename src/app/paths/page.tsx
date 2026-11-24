"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { CERTS } from "@/lib/certs";
import { activityCount, getPath } from "@/lib/paths";
import { useAppData } from "@/lib/use-app-data";

export default function PathsPage() {
  const { data } = useAppData(false);
  const [q, setQ] = useState("");
  if (!data) return <PageLoading />;
  const list = CERTS.filter((c) => `${c.t} ${c.s}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <AppHeader active="/learn" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <Link href="/learn" className="inline-block bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700" data-testid="paths-back-link">← Learning</Link>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900" data-testid="paths-title">🏅 Certification paths</h1>
        <p className="mb-4 text-slate-500">Pick a certification to see what you need to do and how to do it.</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search certifications…" data-testid="paths-search-input" className="mb-4 w-full max-w-xs border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const p = getPath(c.k);
            const earned = !!data.me.certs?.[c.k]?.earned;
            return (
              <Link key={c.k} href={`/paths/${c.k}`} data-testid={`path-card-${c.k}`} className="flex flex-col border border-slate-200 bg-white p-4 shadow-md hover:shadow-lg" style={{ borderTop: `4px solid ${c.c}` }}>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center text-xl text-white" style={{ background: c.c }}>🏅</span>
                  <div className="min-w-0 flex-1"><div className="text-xs font-bold uppercase tracking-wide text-slate-400">Certification path</div><span className="text-sm text-slate-500">{c.s}</span></div>
                  {earned && <span className="bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">🏅 Earned</span>}
                </div>
                <h2 className="mt-2 text-base font-bold text-slate-900">{c.t}</h2>
                <p className="mt-1 text-sm text-slate-500">{p?.sum ?? "The requirements for this certification are still being confirmed."}</p>
                <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                  <span className="text-slate-500">{p ? `${p.mods.length} lessons · ${activityCount(p)} activities` : ""}</span>
                  <b className="text-indigo-600">View path ›</b>
                </div>
              </Link>
            );
          })}
          {!list.length && <p className="text-slate-500">No certifications match your search.</p>}
        </div>
      </main>
    </>
  );
}
