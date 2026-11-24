"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/dashboard/Avatar";
import Kpi from "@/components/admin/Kpi";
import { trainees, useAdminData, type AdminSub } from "@/lib/admin-data";
import { STATUS } from "@/lib/submissions";
import { ALL_TRIBES, NOTRIBE } from "@/lib/tribes";
import type { Doc, Profile } from "@/lib/types";

const DRIVE_FOLDER = process.env.NEXT_PUBLIC_DRIVE_FOLDER_URL;
const field = "mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-slate-900";
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

  return (
    <div className="border border-slate-200 bg-white shadow-md" data-testid={`subs-row-${id}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} data-testid={`subs-row-toggle-${id}`} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 p-3 text-left">
        <Avatar name={who?.name ?? "?"} size={38} src={typeof who?.info?.avatar === "string" ? who.info.avatar : null} />
        <span className="min-w-0 flex-1 basis-40">
          <b className="block truncate text-slate-900">{who?.name ?? "Unknown trainee"}</b>
          <span className="text-xs text-slate-500">{String(who?.info?.team ?? NOTRIBE)}</span>
        </span>
        <span className="min-w-0 flex-[2] basis-48 truncate text-sm text-slate-700">{no ? `Lesson ${no} · ` : ""}{doc?.t ?? s.lesson_title ?? `Lesson ${s.lesson_id}`}</span>
        <span className="text-xs text-slate-500">{fmt(s.updated_at || s.created_at)}</span>
        <span className={`whitespace-nowrap px-2 py-0.5 text-xs font-semibold ${st.cls}`} data-testid={`subs-status-${id}`}>{st.label}{s.status === "approved" && s.score != null ? ` · ⭐ ${s.score}/100` : ""}</span>
        <span aria-hidden="true" className="text-slate-400">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-200 p-4">
          <a href={s.url} target="_blank" rel="noopener noreferrer" data-testid={`subs-open-file-${id}`} className="inline-block bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white shadow-md">📄 Open submitted file ↗</a>
          {s.note && <p className="mt-3 text-sm text-slate-500"><b className="text-slate-700">Trainee note:</b> {s.note}</p>}
          <label className="mt-3 block text-sm font-semibold text-slate-700" htmlFor={`sc_${id}`}>Score (0–100) · needed to approve</label>
          <input id={`sc_${id}`} type="number" min={0} max={100} inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value)} data-testid={`subs-score-input-${id}`} className={`${field} max-w-[140px]`} />
          <label className="mt-3 block text-sm font-semibold text-slate-700" htmlFor={`fb_${id}`}>Your feedback</label>
          <textarea id={`fb_${id}`} rows={3} maxLength={800} placeholder="Write what was good, or what needs to change" value={fb} onChange={(e) => setFb(e.target.value)} data-testid={`subs-feedback-input-${id}`} className={field} />
          {msg && <p className="mt-2 text-sm font-semibold text-red-600" data-testid={`subs-message-${id}`}>{msg}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => go("approved")} data-testid={`subs-approve-button-${id}`} className="bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60">✅ Approve</button>
            <button type="button" disabled={busy} onClick={() => go("revise")} data-testid={`subs-revise-button-${id}`} className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60">🔁 Needs changes</button>
          </div>
          {s.reviewed_at && <p className="mt-3 text-xs text-slate-500">Last reviewed by {s.reviewed_by || "an admin"} on {fmt(s.reviewed_at)}</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminSubmissionsPage() {
  const { data, review, reload } = useAdminData();
  const [status, setStatus] = useState("");
  const [lesson, setLesson] = useState("");
  const [tribe, setTribe] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

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

  if (!data || !users) return <main className="p-8 text-slate-500">Loading…</main>;
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
      <main className="mx-auto max-w-5xl px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900" data-testid="subs-title">📤 Submissions</h1>
            <p className="text-slate-500">Review the finished tasks from your trainees</p>
          </div>
          {DRIVE_FOLDER && <a href={DRIVE_FOLDER} target="_blank" rel="noopener noreferrer" data-testid="subs-drive-folder-link" className="border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">📁 Drive folder ↗</a>}
          <button type="button" onClick={reload} data-testid="subs-refresh-button" className="border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">↻ Refresh</button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi id="subs-kpi-all" icon="📥" tint="bg-indigo-50 text-indigo-700" label="All submissions" value={sorted.length} hint={`From ${who} trainee${who === 1 ? "" : "s"}`} />
          <Kpi id="subs-kpi-waiting" icon="⏳" tint="bg-amber-100 text-amber-800" label="Waiting for review" value={cnt("submitted")} hint="Needs your attention" />
          <Kpi id="subs-kpi-approved" icon="✅" tint="bg-green-100 text-green-800" label="Approved" value={cnt("approved")} hint={avgScore != null ? `Average score ${avgScore}` : "Done and dusted"} />
          <Kpi id="subs-kpi-revise" icon="⚠️" tint="bg-red-100 text-red-800" label="Needs changes" value={cnt("revise")} hint="Sent back to trainees" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          {tabs.map(([k, l, n]) => (
            <button key={k || "all"} type="button" role="tab" aria-selected={status === k} onClick={() => setStatus(k)} data-testid={`subs-filter-${k || "all"}`}
              className={`border px-3 py-1.5 text-sm font-semibold ${status === k ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-700"}`}>
              {l} <b>{n}</b>
            </button>
          ))}
        </div>

        <div className="my-3 flex flex-wrap gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search trainee, lesson or tribe" data-testid="subs-search-input" aria-label="Search" className={`${field} mt-0 min-w-[200px] max-w-xs flex-1`} />
          <select value={lesson} onChange={(e) => setLesson(e.target.value)} data-testid="subs-lesson-select" aria-label="Lesson" className={`${field} mt-0 min-w-[150px] max-w-[260px] flex-1`}>
            <option value="">All lessons</option>
            {lessons.map(([id, t]) => <option key={id} value={id}>{t}</option>)}
          </select>
          <select value={tribe} onChange={(e) => setTribe(e.target.value)} data-testid="subs-tribe-select" aria-label="Tribe" className={`${field} mt-0 min-w-[140px] max-w-[200px] flex-1`}>
            <option value="">All tribes</option>
            {ALL_TRIBES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          {list.map((s) => {
            const idx = docs.findIndex((d) => d.id === Number(s.lesson_id));
            const id = String(s.id);
            return <Row key={id} s={s} who={uOf(s)} doc={docs[idx]} no={idx + 1} open={openId === id} onToggle={() => setOpenId(openId === id ? null : id)} onReview={review} />;
          })}
          {list.length === 0 && (
            <div className="border border-slate-200 bg-white p-8 text-center shadow-md" data-testid="subs-empty">
              <div className="text-3xl">📭</div>
              <b className="text-slate-900">{sorted.length ? "No submissions match" : "No submissions yet"}</b>
              <p className="text-sm text-slate-500">{sorted.length ? "Try another filter." : "When trainees submit their work, it will show up here."}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
