"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/dashboard/Avatar";
import { useAdminData } from "@/lib/admin-data";
import { CERTS } from "@/lib/certs";
import { certsEarned } from "@/lib/progress";
import { STATUS } from "@/lib/submissions";

const box = "border border-slate-200 bg-white p-5 shadow-md";
const fmt = (d?: string | null) => {
  try { return new Date(d ?? "").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return ""; }
};

function TraineeDetail() {
  const params = useParams<{ id: string }>();
  const { data } = useAdminData();
  if (!data) return <main className="p-8 text-slate-500">Loading…</main>;
  const { docs, users, subs } = data;
  const u = users.find((x) => String(x.id) === String(params.id));

  if (!u) {
    return (
      <>
        <AppHeader active="/admin/trainees" />
        <main className="mx-auto max-w-5xl px-4 py-5">
          <p className="text-slate-500" data-testid="trainee-not-found">That person was not found.</p>
          <Link href="/admin/trainees" data-testid="trainee-notfound-back-link" className="font-semibold text-indigo-600 underline">← Trainees</Link>
        </main>
      </>
    );
  }
  const team = String(u.info?.team ?? "");
  const mine = subs.filter((s) => String(s.user_id) === u.id);

  return (
    <>
      <AppHeader active="/admin/trainees" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <Link href="/admin/trainees" data-testid="trainee-back-link" className="inline-block border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">← Trainees</Link>

        <section className={`${box} mt-4 flex flex-wrap items-center gap-4`} data-testid="trainee-header">
          <Avatar name={u.name} size={56} src={typeof u.info?.avatar === "string" ? u.info.avatar : null} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-extrabold text-slate-900" data-testid="trainee-detail-name">{u.name}</h1>
            <p className="text-slate-500">{u.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {team && <span className="bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{team}</span>}
              <span className="bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">{u.track} track</span>
            </div>
          </div>
          <div className="text-right"><div className="text-3xl font-extrabold text-slate-900" data-testid="trainee-detail-certs">{certsEarned(u)}/{CERTS.length}</div><div className="text-sm text-slate-500">certificates earned</div></div>
        </section>

        <h2 className="mt-6 mb-2 text-lg font-bold text-slate-900">📤 Submissions</h2>
        <section className={box} data-testid="trainee-submissions">
          {mine.length === 0 ? (
            <p className="text-sm text-slate-500" data-testid="trainee-submissions-empty">This trainee has not submitted any work yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {mine.map((s) => {
                const idx = docs.findIndex((d) => d.id === Number(s.lesson_id));
                const st = STATUS[s.status];
                return (
                  <li key={s.id} data-testid={`trainee-submission-${s.id}`} className="flex flex-wrap items-center gap-2 border border-slate-200 p-2.5">
                    <div className="min-w-0 flex-1 basis-48">
                      <b className="block truncate text-sm text-slate-900">{idx >= 0 ? `Lesson ${idx + 1} · ` : ""}{docs[idx]?.t ?? s.lesson_title ?? "Lesson"}</b>
                      <span className="text-xs text-slate-500">{fmt(s.updated_at || s.created_at)}</span>
                    </div>
                    <span className={`whitespace-nowrap px-2 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}{s.status === "approved" && s.score != null ? ` · ⭐ ${s.score}/100` : ""}</span>
                    <Link href={`/admin/submissions?q=${encodeURIComponent(u.name)}`} data-testid={`trainee-submission-review-${s.id}`} className="text-sm font-semibold text-indigo-600 underline">Review</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <h2 className="mt-6 mb-2 text-lg font-bold text-slate-900">🏅 Certificates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CERTS.map((c) => {
            const d = u.certs?.[c.k];
            return (
              <div key={c.k} data-testid={`trainee-cert-${c.k}`} className="border border-slate-200 bg-white p-4 shadow-md" style={{ borderTop: `4px solid ${c.c}` }}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900">{c.t}</h3><p className="text-sm text-slate-500">{c.s}</p></div>
                  {d?.earned ? <span className="bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">🏅 Earned</span> : <span className="bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Not earned yet</span>}
                </div>
                {d?.earned && (
                  <p className="mt-2 text-sm text-slate-700">
                    Earned on <b>{d.date ?? "—"}</b>
                    {d.url && <> · <a href={d.url} target="_blank" rel="noopener noreferrer" data-testid={`trainee-cert-link-${c.k}`} className="font-semibold text-indigo-600 underline">Certificate link ↗</a></>}
                    {d.cid && <> · ID: {d.cid}</>}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<main className="p-8 text-slate-500">Loading…</main>}>
      <TraineeDetail />
    </Suspense>
  );
}
