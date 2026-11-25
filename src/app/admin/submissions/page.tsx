"use client";

import { showLoading } from "@/lib/overlay";
import PageLoading from "@/components/PageLoading";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Av from "@/components/dashboard/Av";
import Kpi from "@/components/admin/Kpi";
import { trainees, useAdminData, type AdminSub } from "@/lib/admin-data";
import { STATUS } from "@/lib/submissions";
import { safeHref } from "@/lib/safe-url";
import { ALL_TRIBES, NOTRIBE } from "@/lib/tribes";
import type { Doc, Profile } from "@/lib/types";

const DRIVE_FOLDER = process.env.NEXT_PUBLIC_DRIVE_FOLDER_URL;
const SC: Record<string, [string, string]> = { submitted: ["#92400e", "#fef3c7"], approved: ["#166534", "#dcfce7"], revise: ["#991b1b", "#fee2e2"] };
const fmt = (d?: string | null) => {
  try { return new Date(d ?? "").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return ""; }
};
const when = (s: AdminSub) => +new Date(s.updated_at || s.created_at);

function Row({ s, who, doc, no, open, onToggle, onReview }: {
  s: AdminSub; who: Profile | undefined; doc: Doc | undefined; no: number; open: boolean; onToggle: () => void;
  onReview: (id: string, st: "approved" | "revise", score: number | null, fb: string) => Promise<string>;
}) {
  const [score, setScore] = useState(s.score != null ? String(s.score) : "");
  const [fb, setFb] = useState(s.feedback ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const st = STATUS[s.status];
  const id = String(s.id);

  async function go(status: "approved" | "revise") {
    setMsg("");
    const feedback = fb.trim();
    if (status === "revise" && !feedback) return setMsg("Please write what needs to change.");
    let sc: number | null = null;
    if (status === "approved") {
      if (!/^\d{1,3}$/.test(score.trim()) || Number(score) > 100) return setMsg("Please enter a score from 0 to 100 to approve.");
      sc = parseInt(score, 10);
    }
    setBusy(true);
    const err = await onReview(id, status, sc, feedback);
    setBusy(false);
    setMsg(err);
  }

  const col = SC[s.status] ?? SC.submitted;
  return (
    <div className={`card sbi${open ? " open" : ""}`} data-testid={`subs-row-${id}`}>
      <div className="sh" role="button" tabIndex={0} onClick={onToggle} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }} aria-expanded={open} data-testid={`subs-row-toggle-${id}`}>
        <div className="who">
          <Av name={who?.name ?? "?"} src={typeof who?.info?.avatar === "string" ? who.info.avatar : null} style={{ width: 38, height: 38, fontSize: 13, flex: "none" }} />
          <div className="wn"><b>{who?.name ?? "Unknown trainee"}</b><span className="mu">{String(who?.info?.team ?? "") || "No tribe"}</span></div>
        </div>
        <div className="ls">{no ? `Lesson ${no} · ` : ""}{doc?.t ?? s.lesson_title ?? `Lesson ${s.lesson_id}`}</div>
        <div className="dt mu">{fmt(s.updated_at || s.created_at)}</div>
        <div className="stc"><span className="sch" style={{ color: col[0], background: col[1] }} data-testid={`subs-status-${id}`}>{st.label}{s.status === "approved" && s.score != null ? ` · ⭐ ${s.score}/100` : ""}</span></div>
        <span className="chev" aria-hidden="true">▾</span>
      </div>
      <div className="sbd">
        <div className="row"><a className="btn s" href={safeHref(s.url)} target="_blank" rel="noopener noreferrer" data-testid={`subs-open-file-${id}`} style={{ textDecoration: "none" }}>📄 Open submitted file ↗</a></div>
        {s.note && <p className="mu" style={{ margin: "10px 0 0" }}><b>Trainee note:</b> {s.note}</p>}
        <label data-testid="admin-submissions-label-1" htmlFor={`sc_${id}`}>Score (0–100) · needed to approve</label>
        <div className="stp">
          <button type="button" aria-label="Decrease score" data-testid={`subs-score-minus-${id}`} onClick={() => setScore(String(Math.max(0, (parseInt(score, 10) || 0) - 5)))}>−</button>
          <input id={`sc_${id}`} type="number" min={0} max={100} inputMode="numeric" placeholder="0–100" value={score} onChange={(e) => setScore(e.target.value)} data-testid={`subs-score-input-${id}`} />
          <button type="button" aria-label="Increase score" data-testid={`subs-score-plus-${id}`} onClick={() => setScore(String(Math.min(100, (parseInt(score, 10) || 0) + 5)))}>+</button>
        </div>
        <label data-testid="admin-submissions-label-2" htmlFor={`fb_${id}`}>Your feedback</label>
        <textarea id={`fb_${id}`} rows={3} maxLength={800} placeholder="Write what was good, or what needs to change" value={fb} onChange={(e) => setFb(e.target.value)} data-testid={`subs-feedback-input-${id}`} />
        <div className="msg" data-testid={`subs-message-${id}`}>{msg}</div>
        <div className="row">
          <button type="button" className="btn" disabled={busy} onClick={() => go("approved")} data-testid={`subs-approve-button-${id}`}>✅ Approve</button>
          <button type="button" className="btn g" disabled={busy} onClick={() => go("revise")} data-testid={`subs-revise-button-${id}`}>🔁 Needs changes</button>
        </div>
        {s.reviewed_at && <p className="mu" style={{ margin: "10px 0 0" }}>Last reviewed by {s.reviewed_by || "an admin"} on {fmt(s.reviewed_at)}</p>}
      </div>
    </div>
  );
}

export default function AdminSubmissionsPage() {
  const { data, review } = useAdminData();
  const [status, setStatus] = useState("");
  const [lesson, setLesson] = useState("");
  const [tribe, setTribe] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [spin, setSpin] = useState(false);
  // A real page refresh: the whole page reloads and fetches the newest submissions.
  function refresh() {
    setSpin(true);
    showLoading("Refreshing…", "Getting the latest submissions");
    setTimeout(() => window.location.reload(), 250);
  }

  // Links from the admin dashboard can open this page already filtered (?status=submitted&q=Name).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setStatus(p.get("status") ?? "");
    setQ(p.get("q") ?? "");
  }, []);

  const subs = data?.subs;
  const users = data?.users;
  const sorted = useMemo(
    () => [...(subs ?? [])].sort((a, b) => (a.status === "submitted" ? 0 : 1) - (b.status === "submitted" ? 0 : 1) || when(b) - when(a)),
    [subs]
  );

  if (!data || !users) return <PageLoading />;
  const { docs } = data;
  const uOf = (s: AdminSub) => users.find((u) => String(u.id) === String(s.user_id));
  const cnt = (k: string) => sorted.filter((s) => s.status === k).length;
  const lessons = [...new Map(sorted.map((s) => [String(s.lesson_id), docs.find((d) => d.id === Number(s.lesson_id))?.t ?? s.lesson_title ?? `Lesson ${s.lesson_id}`])).entries()];
  const ql = q.trim().toLowerCase();
  const list = sorted.filter((s) => {
    const u = uOf(s);
    const title = docs.find((d) => d.id === Number(s.lesson_id))?.t ?? s.lesson_title ?? "";
    return (!status || s.status === status) && (!lesson || String(s.lesson_id) === lesson) && (!tribe || String(u?.info?.team ?? "") === tribe) &&
      (!ql || `${u?.name ?? ""} ${title} ${u?.info?.team ?? ""}`.toLowerCase().includes(ql));
  });
  const approved = sorted.filter((s) => s.status === "approved" && s.score != null);
  const avgScore = approved.length ? Math.round(approved.reduce((a, s) => a + (s.score ?? 0), 0) / approved.length) : null;
  const who = new Set(sorted.map((s) => String(s.user_id))).size;
  const tabs: [string, string, number][] = [["", "All", sorted.length], ["submitted", "Waiting", cnt("submitted")], ["approved", "Approved", cnt("approved")], ["revise", "Needs changes", cnt("revise")]];

  return (
    <>
      <AppHeader active="/admin/submissions" />
      <main data-testid="admin-submissions-main-1">
        <div className="row" style={{ marginBottom: 14 }}>
          <div className="grow" style={{ flex: "1 1 220px" }}>
            <h1 style={{ margin: 0 }} data-testid="subs-title">📤 Submissions</h1>
            <div className="mu">Review the finished tasks from your trainees</div>
          </div>
          {DRIVE_FOLDER && <a className="btn g s" href={DRIVE_FOLDER} target="_blank" rel="noopener noreferrer" data-testid="subs-drive-folder-link" style={{ textDecoration: "none" }}>📁 Drive folder ↗</a>}
          <button type="button" className="btn g s" onClick={refresh} data-testid="subs-refresh-button" title="Refresh"><span className={`rfb${spin ? " rot" : ""}`}>↻</span> Refresh</button>
        </div>

        <div className="kp">
          <Kpi id="subs-kpi-all" icon="inbox" color="#6d5efc" bg="var(--pr2)" label="All submissions" value={sorted.length} hint={`From ${who} trainee(s)`} />
          <Kpi id="subs-kpi-waiting" icon="clock" color="#d97706" bg="#fff4dc" label="Waiting for review" value={cnt("submitted")} hint="Needs your attention" />
          <Kpi id="subs-kpi-approved" icon="check" color="#14a37f" bg="#e6f7ef" label="Approved" value={cnt("approved")} hint={avgScore != null ? `Average score ${avgScore}` : "Done and dusted"} />
          <Kpi id="subs-kpi-revise" icon="alert" color="#dc2626" bg="#fee2e2" label="Needs changes" value={cnt("revise")} hint="Sent back to trainees" />
        </div>

        <div className="fchs" role="tablist" aria-label="Filter by status">
          {tabs.map(([k, l, n]) => (
            <button key={k || "all"} type="button" role="tab" aria-selected={status === k} onClick={() => setStatus(k)} data-testid={`subs-filter-${k || "all"}`} className={`fch ${status === k ? "on" : ""}`}>
              {l} <b>{n}</b>
            </button>
          ))}
        </div>

        <div className="row" style={{ margin: "12px 0" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search trainee, lesson or tribe" data-testid="subs-search-input" aria-label="Search" style={{ maxWidth: 300, flex: "1 1 200px" }} />
          <select value={lesson} onChange={(e) => setLesson(e.target.value)} data-testid="subs-lesson-select" aria-label="Lesson" style={{ maxWidth: 260, flex: "1 1 160px" }}>
            <option value="">All lessons</option>
            {lessons.map(([id, t]) => <option key={id} value={id}>{t}</option>)}
          </select>
          <select value={tribe} onChange={(e) => setTribe(e.target.value)} data-testid="subs-tribe-select" aria-label="Tribe" style={{ maxWidth: 200, flex: "1 1 140px" }}>
            <option value="">All tribes</option>
            {ALL_TRIBES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="sbl">
          {list.map((s) => {
            const idx = docs.findIndex((d) => d.id === Number(s.lesson_id));
            const id = String(s.id);
            return <Row key={id} s={s} who={uOf(s)} doc={docs[idx]} no={idx + 1} open={openId === id} onToggle={() => setOpenId(openId === id ? null : id)} onReview={review} />;
          })}
          {list.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: 30 }} data-testid="subs-empty">
              <div style={{ fontSize: 34 }}>📭</div>
              <b>{sorted.length ? "No submissions match" : "No submissions yet"}</b>
              <div className="mu">{sorted.length ? "Try another filter." : "When trainees submit their work, it will show up here."}</div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
