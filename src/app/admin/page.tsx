"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import Av from "@/components/dashboard/Av";
import Top5 from "@/components/dashboard/Top5";
import { Donut } from "@/components/dashboard/Overview";
import GrowthCard from "@/components/admin/GrowthCard";
import LineChart from "@/components/admin/LineChart";
import { scoreFromSubs, trainees, useAdminData } from "@/lib/admin-data";
import { certsEarned, overallProgress } from "@/lib/progress";
import { ALL_TRIBES, NOTRIBE, TRIBES } from "@/lib/tribes";

const TCOL = ["#6d5efc", "#14c8b4", "#f59e0b", "#e5484d", "#2f6fed", "#a855f7", "#16a36a", "#ec4899"];
const GREY = "#94a3b8";
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export default function AdminDashboard() {
  const { data } = useAdminData();
  if (!data) return <PageLoading />;
  const { me, docs, users, subs } = data;
  const tr = trainees(users);
  const avgOf = (a: typeof tr) => (a.length ? Math.round(a.reduce((s, u) => s + overallProgress(u, docs), 0) / a.length) : 0);
  const avg = avgOf(tr);
  const certTotal = tr.reduce((s, u) => s + certsEarned(u), 0);
  const holders = tr.filter((u) => certsEarned(u) > 0).length;

  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const waiting = subs.filter((s) => s.status === "submitted").sort((a, b) => +new Date(a.updated_at || a.created_at) - +new Date(b.updated_at || b.created_at));
  const days = waiting.length ? Math.floor((Date.now() - +new Date(waiting[0].updated_at || waiting[0].created_at)) / 864e5) : 0;

  const star = tr
    .map((u) => ({ u, sc: scoreFromSubs(u.id, subs), p: overallProgress(u, docs) }))
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc || b.p - a.p)[0];
  const approvedCount = star ? subs.filter((s) => String(s.user_id) === star.u.id && s.status === "approved").length : 0;
  const idle = tr.filter((u) => overallProgress(u, docs) === 0);

  const tribeOf = (u: (typeof tr)[number]) => String(u.info?.team ?? "");
  const groups = [
    ...TRIBES.map((t, i) => ({ t, col: TCOL[i], m: tr.filter((u) => tribeOf(u) === t) })),
    { t: NOTRIBE, col: GREY, m: tr.filter((u) => tribeOf(u) === NOTRIBE) },
    { t: "Not selected yet", col: GREY, m: tr.filter((u) => !ALL_TRIBES.includes(tribeOf(u))) },
  ].filter((g) => g.t !== "Not selected yet" || g.m.length);
  const chartG = groups.map((g) => ({ t: g.t, n: g.m.length, a: avgOf(g.m), c: g.m.reduce((s, u) => s + certsEarned(u), 0), col: g.col }));

  const done = tr.filter((u) => overallProgress(u, docs) >= 100).length;
  const prog = tr.filter((u) => { const q = overallProgress(u, docs); return q > 0 && q < 100; }).length;
  const none = tr.length - done - prog;

  const learners = tr.map((u) => ({ ...u, score: scoreFromSubs(u.id, subs) }));

  return (
    <>
      <AppHeader active="/admin" />
      <main data-testid="admin-main-1">
        <section data-testid="admin-section-1" className="spot">
          <div className="spt">
            <div>
              <div className="mu">{today}</div>
              <h1 data-testid="admin-greeting">{greet}, {me.name.split(" ")[0]} 👋</h1>
            </div>
          </div>
          <div className="spg">
            {waiting.length ? (
              <div className="sp spq" data-testid="admin-queue-card">
                <div className="sk"><span className="pd" /> Review queue</div>
                <div className="sn" data-testid="admin-queue-count">{waiting.length}</div>
                <div><b>{waiting.length === 1 ? "submission" : "submissions"} waiting for you</b></div>
                <div className="mu">{days ? `Oldest has waited ${plural(days, "day")}` : "Newest work just came in"}</div>
                <div className="spa"><Link href="/admin/submissions?status=submitted" className="btn" data-testid="admin-queue-button">Review now ›</Link></div>
              </div>
            ) : (
              <div className="sp spok" data-testid="admin-queue-card">
                <div className="sk">✅ Review queue</div>
                <div className="sn" data-testid="admin-queue-count">0</div>
                <div><b>You are all caught up!</b></div>
                <div className="mu">New submissions will appear here.</div>
                <div className="spa"><Link href="/admin/submissions" className="btn g" data-testid="admin-queue-button">Open submissions</Link></div>
              </div>
            )}

            {star ? (
              <div className="sp sps" data-testid="admin-star-card">
                <div className="sk">🌟 Star learner</div>
                <div className="spp">
                  <div className="spc">
                    <span className="crown2">👑</span>
                    <Av name={star.u.name} src={star.u.info?.avatar as string | undefined} style={{ width: 62, height: 62, fontSize: 21, border: "3px solid #f5b301" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <b className="spn" data-testid="admin-star-name">{star.u.name}</b>
                    <div className="mu">{tribeOf(star.u) || "No tribe"}</div>
                  </div>
                </div>
                <div><b data-testid="admin-star-points">{star.sc} points</b> <span className="mu">from {plural(approvedCount, "approved task")}</span></div>
                <div className="spa"><Link href={`/admin/submissions?status=approved&q=${encodeURIComponent(star.u.name)}`} className="btn g" data-testid="admin-star-button">See their work ›</Link></div>
              </div>
            ) : (
              <div className="sp sps" data-testid="admin-star-card">
                <div className="sk">🌟 Star learner</div>
                <div className="sn">–</div>
                <div><b data-testid="admin-star-empty">No star yet</b></div>
                <div className="mu">Approve a submission with a score to crown the first star.</div>
              </div>
            )}

            {idle.length ? (
              <div className="sp spn2" data-testid="admin-nudge-card">
                <div className="sk">🔔 Needs a nudge</div>
                <div className="sn" data-testid="admin-nudge-count">{idle.length}</div>
                <div><b>{idle.length === 1 ? "trainee" : "trainees"} not started yet</b></div>
                <div className="stk">
                  {idle.slice(0, 5).map((u) => <Av key={u.id} name={u.name} src={u.info?.avatar as string | undefined} style={{ width: 34, height: 34, fontSize: 12 }} />)}
                  {idle.length > 5 && <span className="av" style={{ width: 34, height: 34, fontSize: 11, background: "var(--br)", color: "var(--mu)" }}>+{idle.length - 5}</span>}
                </div>
                <div className="spa"><Link href="/admin/trainees" className="btn g" data-testid="admin-nudge-button">See people ›</Link></div>
              </div>
            ) : (
              <div className="sp spn2" data-testid="admin-nudge-card">
                <div className="sk">🚀 Momentum</div>
                <div className="sn" data-testid="admin-nudge-count">{tr.length}</div>
                <div><b>{tr.length ? "Everyone has started learning!" : "No trainees yet"}</b></div>
                <div className="mu">{tr.length ? "Great energy across the academy." : "Share the app link so they can sign up."}</div>
              </div>
            )}
          </div>
        </section>

        <Top5 learners={learners} docs={docs} meId={me.id} myScore={0} admin />

        <GrowthCard trainees={tr} docs={docs} />

        <div className="cgw">
          <div className="cg c3">
            <section className="card cc w2" id="grp" data-testid="admin-tribe-section">
              <div className="ch">
                <div><h3>Training progress by tribe</h3><div className="mu">Average progress per tribe (lessons plus certifications)</div></div>
                <div style={{ textAlign: "right" }}><div className="stat">{avg}%</div><div className="mu">all trainees</div></div>
              </div>
              <div className="lcw"><LineChart g={chartG} /></div>
            </section>
            <section className="card cc" data-testid="admin-status-card">
              <div className="ch"><div><h3>Training status</h3><div className="mu">Where every trainee stands</div></div></div>
              <div className="dnw">
                <Donut parts={[{ v: done, c: "#16a36a" }, { v: prog, c: "#6d5efc" }, { v: none, c: "#cbd5e1" }]} z={150} mid={`${avg}%`} sub="average" />
                <div className="lgd">
                  <div><i style={{ background: "#16a36a" }} />Completed<b>{done}</b></div>
                  <div><i style={{ background: "#6d5efc" }} />In progress<b>{prog}</b></div>
                  <div><i style={{ background: "#cbd5e1" }} />Not started<b>{none}</b></div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <Link href="/admin/trainees" className="ctb" data-testid="admin-trainees-banner" aria-label="Open trainees and certificates">
          <div className="cti" aria-hidden="true">🎓</div>
          <div className="ctx">
            <b>Trainees &amp; certificates</b>
            <div className="cch"><span>👥 {plural(tr.length, "trainee")}</span><span>🏅 {holders} certified</span><span>📜 {certTotal} earned</span></div>
          </div>
          <div className="cav">
            {tr.slice(0, 4).map((u) => <Av key={u.id} name={u.name} src={u.info?.avatar as string | undefined} />)}
            {tr.length > 4 && <span className="cm">+{tr.length - 4}</span>}
          </div>
          <span className="cgo">View all trainees <i>→</i></span>
        </Link>
      </main>
    </>
  );
}
