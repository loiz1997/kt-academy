"use client";

import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/dashboard/Avatar";
import GrowthCard from "@/components/admin/GrowthCard";
import Kpi from "@/components/admin/Kpi";
import { scoreFromSubs, trainees, useAdminData } from "@/lib/admin-data";
import { activeDocs, isSoon } from "@/lib/lessons";
import { certsEarned, lessonsDone, overallProgress } from "@/lib/progress";
import { ALL_TRIBES, NOTRIBE, TRIBES } from "@/lib/tribes";

const TCOL = ["#6d5efc", "#14c8b4", "#f59e0b", "#e5484d", "#2f6fed", "#a855f7", "#16a36a", "#ec4899"];
const GREY = "#94a3b8";
const str = (v: unknown) => (typeof v === "string" ? v : "");
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const card = "border border-slate-200 bg-white p-5 shadow-md";
const btn = "inline-block bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md";
const btnGhost = "inline-block border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700";

export default function AdminDashboard() {
  const { data } = useAdminData();
  if (!data) return <main className="p-8 text-slate-500">Loading…</main>;
  const { me, docs, users, subs } = data;
  const tr = trainees(users);
  const active = activeDocs(docs);
  const avgOf = (a: typeof tr) => (a.length ? Math.round(a.reduce((s, u) => s + overallProgress(u, docs), 0) / a.length) : 0);
  const avg = avgOf(tr);
  const started = tr.filter((u) => u.done?.length).length;
  const lessonsTotal = tr.reduce((s, u) => s + lessonsDone(u, docs), 0);
  const certTotal = tr.reduce((s, u) => s + certsEarned(u), 0);
  const holders = tr.filter((u) => certsEarned(u) > 0).length;
  const soonN = docs.filter(isSoon).length;

  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  // Review queue
  const waiting = subs.filter((s) => s.status === "submitted").sort((a, b) => +new Date(a.updated_at || a.created_at) - +new Date(b.updated_at || b.created_at));
  const days = waiting.length ? Math.floor((Date.now() - +new Date(waiting[0].updated_at || waiting[0].created_at)) / 864e5) : 0;

  // Star learner
  const star = tr
    .map((u) => ({ u, sc: scoreFromSubs(u.id, subs), p: overallProgress(u, docs) }))
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc || b.p - a.p)[0];
  const approvedCount = star ? subs.filter((s) => String(s.user_id) === star.u.id && s.status === "approved").length : 0;

  // Trainees who have not started
  const idle = tr.filter((u) => overallProgress(u, docs) === 0);

  // Progress by tribe
  const tribeOf = (u: (typeof tr)[number]) => String(u.info?.team ?? "");
  const groups = [
    ...TRIBES.map((t, i) => ({ t, col: TCOL[i], m: tr.filter((u) => tribeOf(u) === t) })),
    { t: NOTRIBE, col: GREY, m: tr.filter((u) => tribeOf(u) === NOTRIBE) },
    { t: "Not selected yet", col: GREY, m: tr.filter((u) => !ALL_TRIBES.includes(tribeOf(u))) },
  ].filter((g) => g.t !== "Not selected yet" || g.m.length);

  return (
    <>
      <AppHeader active="/admin" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <p className="text-sm text-slate-500">{today}</p>
        <h1 className="mb-4 text-2xl font-extrabold text-slate-900" data-testid="admin-greeting">{greet}, {me.name.split(" ")[0]} 👋</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <section className={card} data-testid="admin-queue-card">
            <div className="text-sm font-bold text-slate-600">{waiting.length ? "🟠" : "✅"} Review queue</div>
            <div className="mt-1 text-4xl font-extrabold text-slate-900" data-testid="admin-queue-count">{waiting.length}</div>
            <p className="font-bold text-slate-900">{waiting.length ? `${waiting.length === 1 ? "submission" : "submissions"} waiting for you` : "You are all caught up!"}</p>
            <p className="mb-3 text-sm text-slate-500">{waiting.length ? (days ? `Oldest has waited ${plural(days, "day")}` : "Newest work just came in") : "New submissions will appear here."}</p>
            <Link href={waiting.length ? "/admin/submissions?status=submitted" : "/admin/submissions"} data-testid="admin-queue-button" className={waiting.length ? btn : btnGhost}>
              {waiting.length ? "Review now ›" : "Open submissions"}
            </Link>
          </section>

          <section className={card} data-testid="admin-star-card">
            <div className="text-sm font-bold text-slate-600">🌟 Star learner</div>
            {star ? (
              <>
                <div className="mt-2 flex items-center gap-3">
                  <span className="relative">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl" aria-hidden="true">👑</span>
                    <Avatar name={star.u.name} size={56} ring="#f5b301" src={str(star.u.info?.avatar)} />
                  </span>
                  <div className="min-w-0">
                    <b className="block truncate text-slate-900" data-testid="admin-star-name">{star.u.name}</b>
                    <span className="text-sm text-slate-500">{tribeOf(star.u) || NOTRIBE}</span>
                  </div>
                </div>
                <p className="mt-2 text-slate-900"><b data-testid="admin-star-points">{star.sc} points</b> <span className="text-sm text-slate-500">from {plural(approvedCount, "approved task")}</span></p>
                <Link href={`/admin/submissions?status=approved&q=${encodeURIComponent(star.u.name)}`} data-testid="admin-star-button" className={`${btnGhost} mt-3`}>See their work ›</Link>
              </>
            ) : (
              <>
                <div className="mt-1 text-4xl font-extrabold text-slate-900">–</div>
                <p className="font-bold text-slate-900" data-testid="admin-star-empty">No star yet</p>
                <p className="text-sm text-slate-500">Approve a submission with a score to crown the first star.</p>
              </>
            )}
          </section>

          <section className={card} data-testid="admin-nudge-card">
            <div className="text-sm font-bold text-slate-600">{idle.length ? "👋 Needs a nudge" : "🎉 Great energy"}</div>
            <div className="mt-1 text-4xl font-extrabold text-slate-900" data-testid="admin-nudge-count">{idle.length}</div>
            {tr.length === 0 ? (
              <p className="text-sm text-slate-500">No trainees yet. Share the app link so they can sign up.</p>
            ) : idle.length ? (
              <>
                <p className="font-bold text-slate-900">{idle.length === 1 ? "trainee has" : "trainees have"} not started</p>
                <p className="text-sm text-slate-500">{idle.slice(0, 3).map((u) => u.name.split(" ")[0]).join(", ")}{idle.length > 3 ? ` and ${idle.length - 3} more` : ""}</p>
              </>
            ) : (
              <>
                <p className="font-bold text-slate-900">Everyone has started</p>
                <p className="text-sm text-slate-500">Great energy across the academy.</p>
              </>
            )}
          </section>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi id="admin-kpi-trainees" icon="👥" tint="bg-indigo-50 text-indigo-700" label="Trainees" value={tr.length} hint={`${started} started learning`} percent={tr.length ? Math.round((started / tr.length) * 100) : 0} />
          <Kpi id="admin-kpi-progress" icon="📈" tint="bg-green-100 text-green-800" label="Average progress" value={`${avg}%`} hint="Lessons and certificates" percent={avg} />
          <Kpi id="admin-kpi-lessons" icon="📚" tint="bg-amber-100 text-amber-800" label="Lessons completed" value={lessonsTotal} hint={`across ${plural(active.length, "lesson")}${soonN ? ` · ${soonN} coming soon` : ""}`} />
          <Kpi id="admin-kpi-certs" icon="🏅" tint="bg-violet-100 text-teal-700" label="Certificates" value={certTotal} hint={`${plural(holders, "trainee")} certified`} percent={tr.length ? Math.round((holders / tr.length) * 100) : 0} />
        </div>

        <div className="mt-4"><GrowthCard trainees={tr} docs={docs} /></div>

        <Link href="/admin/trainees" data-testid="admin-trainees-banner" className={`${card} mt-4 flex flex-wrap items-center gap-3 hover:shadow-lg`}>
          <span className="grid h-11 w-11 place-items-center bg-indigo-50 text-2xl" aria-hidden="true">🎓</span>
          <span className="min-w-0 flex-1">
            <b className="block text-slate-900">Trainees &amp; certificates</b>
            <span className="text-sm text-slate-500">👥 {plural(tr.length, "trainee")} · 🏅 {holders} certified · 📜 {certTotal} earned</span>
          </span>
          <span className="font-semibold text-indigo-600">View all trainees →</span>
        </Link>

        <section className={`${card} mt-4`} data-testid="admin-tribe-section">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Training progress by tribe</h2>
              <p className="text-sm text-slate-500">Average progress per tribe (lessons plus certifications)</p>
            </div>
            <div className="text-right"><div className="text-2xl font-extrabold text-slate-900">{avg}%</div><div className="text-xs text-slate-500">all trainees</div></div>
          </div>
          <div className="flex flex-col gap-2.5">
            {groups.map((g) => {
              const a = avgOf(g.m);
              const c = g.m.reduce((s, u) => s + certsEarned(u), 0);
              return (
                <div key={g.t} data-testid={`admin-tribe-row-${g.t.replace(/[^A-Za-z0-9]+/g, "-")}`} className="grid grid-cols-[minmax(90px,150px)_1fr_44px] items-center gap-x-3 gap-y-0.5 sm:grid-cols-[minmax(90px,170px)_1fr_44px_minmax(120px,170px)]">
                  <span className="truncate text-sm font-semibold text-slate-700">{g.t}</span>
                  <div className="h-2.5 bg-slate-100"><div className="h-full" style={{ width: `${a}%`, background: g.col }} /></div>
                  <span className="text-right text-sm font-bold text-slate-900">{g.m.length ? `${a}%` : "–"}</span>
                  <span className="col-span-3 text-xs text-slate-500 sm:col-span-1">{g.m.length ? `${plural(g.m.length, "trainee")} · 🏅 ${c}` : "No trainees yet"}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
