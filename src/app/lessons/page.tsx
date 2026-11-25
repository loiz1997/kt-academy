"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { getLesson } from "@/lib/lesson-content";
import { activeDocs, isSoon } from "@/lib/lessons";
import { soonToast } from "@/lib/overlay";
import { useAppData } from "@/lib/use-app-data";

const CAT: Record<string, [string, string]> = { Local: ["💻", "#6d5efc"], TestOps: ["☁️", "#14c8b4"], Tools: ["🧰", "#f59e0b"] };
const CATS = ["All", "Local", "TestOps", "Tools"];

export default function LessonsPage() {
  const { data } = useAppData(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  if (!data) return <PageLoading />;
  const { me, docs } = data;
  const act = activeDocs(docs);
  const done = act.filter((d) => me.done.includes(d.id)).length;
  const pct = act.length ? Math.round((done / act.length) * 100) : 0;
  const ql = q.trim().toLowerCase();
  const list = docs.filter((d) => (cat === "All" || d.c === cat) && `${d.t} ${d.b ?? ""}`.toLowerCase().includes(ql));

  return (
    <>
      <AppHeader active="/learn" />
      <main data-testid="lessons-main-1">
        <Link href="/learn" className="btn g s" data-testid="lessons-back-link">← Learning &amp; Tools</Link>
        <h1 className="text-2xl font-extrabold" style={{ margin: "14px 0 4px" }} data-testid="lessons-title">📘 KT lessons</h1>
        <p className="mu" style={{ marginBottom: 16 }}>Step-by-step guides for getting started with Katalon.</p>
        <div className="card" style={{ marginBottom: 16 }} data-testid="lessons-progress">
          <div className="row">
            <div className="grow">
              <b data-testid="lessons-progress-text">{done} of {act.length} lessons completed</b>
              <div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${pct}%` }} /></div>
            </div>
            <span className="stat" style={{ fontSize: 22 }}>{pct}%</span>
          </div>
        </div>
        <div className="row" style={{ marginBottom: 16 }}>
          <input className="lin" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search lessons…" aria-label="Search lessons" data-testid="lessons-search" style={{ maxWidth: 280 }} />
          <div className="tabs">
            {CATS.map((c) => (
              <button key={c} type="button" className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)} data-testid={`lessons-chip-${c.toLowerCase()}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="lgrid" data-testid="lessons-grid">
          {list.map((d) => {
            const n = docs.indexOf(d) + 1;
            const off = isSoon(d);
            const ok = me.done.includes(d.id);
            const [icon, bg] = CAT[d.c] ?? CAT.Tools;
            const R = getLesson(d);
            const sum = R ? R.sum : (d.b ?? "").split("\n")[0].slice(0, 110);
            const body = (
              <>
                <div className="row">
                  <div className="tbadge" style={{ background: bg }}>{icon}</div>
                  <div className="grow">
                    <div className="lnum">Lesson {n}</div>
                    <span className={`tag ${d.c === "TestOps" ? "t" : ""}`}>{d.c}</span> <span className="mu">{d.l}</span>
                  </div>
                  {off ? <span className="tag a">🚧 Coming soon</span> : ok ? <span className="tag t" data-testid={`lesson-done-badge-${n}`}>✓ Done</span> : null}
                </div>
                <h2 data-testid={`lesson-title-${n}`} style={{ margin: "4px 0 0", fontSize: 16 }}>{d.t}</h2>
                <p className="mu">{off ? "This lesson is still in development." : sum}</p>
                <div className="row" style={{ marginTop: "auto" }}>
                  <span className="grow mu">{R && !off ? "📷 Step-by-step with screenshots" : ""}</span>
                  {off ? <span className="btn s dis">🚧 In development</span> : <span className="btn s">View lesson ›</span>}
                </div>
              </>
            );
            return off ? (
              <div key={d.id} className="card lcard off" aria-disabled="true" role="button" tabIndex={0} onClick={soonToast} data-testid={`lesson-card-${n}`}>{body}</div>
            ) : (
              <Link key={d.id} href={`/lessons/${d.id}`} className="card lcard" data-testid={`lesson-card-${n}`}>{body}</Link>
            );
          })}
          {list.length === 0 && <p className="mu" data-testid="lessons-empty">No lessons match your search.</p>}
        </div>
      </main>
    </>
  );
}
