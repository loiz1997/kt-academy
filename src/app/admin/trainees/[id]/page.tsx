"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Av from "@/components/dashboard/Av";
import { useAdminData } from "@/lib/admin-data";
import { CERTS } from "@/lib/certs";
import { certsEarned } from "@/lib/progress";
import { STATUS } from "@/lib/submissions";

const SC: Record<string, [string, string]> = { submitted: ["#92400e", "#fef3c7"], approved: ["#166534", "#dcfce7"], revise: ["#991b1b", "#fee2e2"] };
const fmt = (d?: string | null) => {
  try { return new Date(d ?? "").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return ""; }
};

function TraineeDetail() {
  const params = useParams<{ id: string }>();
  const { data } = useAdminData();
  if (!data) return <PageLoading />;
  const { docs, users, subs } = data;
  const u = users.find((x) => String(x.id) === String(params.id));

  if (!u) {
    return (
      <>
        <AppHeader active="/admin/trainees" />
        <main data-testid="admin-trainees-id-main-1">
          <p className="mu" data-testid="trainee-not-found">That person was not found.</p>
          <Link href="/admin/trainees" data-testid="trainee-notfound-back-link" className="btn g s" style={{ textDecoration: "none", display: "inline-block" }}>← Trainees</Link>
        </main>
      </>
    );
  }
  const team = String(u.info?.team ?? "");
  const mine = subs.filter((s) => String(s.user_id) === u.id);
  const link = { textDecoration: "none", display: "inline-block" } as const;

  return (
    <>
      <AppHeader active="/admin/trainees" />
      <main data-testid="admin-trainees-id-main-2">
        <Link href="/admin/trainees" data-testid="trainee-back-link" className="btn g s" style={link}>← Trainees</Link>

        <div className="card" style={{ marginTop: 14, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }} data-testid="trainee-header">
          <Av name={u.name} src={typeof u.info?.avatar === "string" ? u.info.avatar : null} style={{ width: 56, height: 56, fontSize: 20 }} />
          <div className="grow" style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 22 }} data-testid="trainee-detail-name">{u.name}</h1>
            <div className="mu">{u.email}</div>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              {team && <span className="tag">{team}</span>}
              <span className="tag t">{u.track} track</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}><div className="stat" data-testid="trainee-detail-certs">{certsEarned(u)}/{CERTS.length}</div><div className="mu">certificates earned</div></div>
        </div>

        <h2 data-testid="admin-trainees-id-h2-1" style={{ margin: "20px 0 10px" }}>📤 Submissions</h2>
        <div className="card" data-testid="trainee-submissions">
          {mine.length === 0 ? (
            <p className="mu" style={{ margin: 0 }} data-testid="trainee-submissions-empty">This trainee has not submitted any work yet.</p>
          ) : (
            mine.map((s) => {
              const idx = docs.findIndex((d) => d.id === Number(s.lesson_id));
              const st = STATUS[s.status];
              const col = SC[s.status] ?? SC.submitted;
              return (
                <div key={s.id} data-testid={`trainee-submission-${s.id}`} className="mrow">
                  <div className="grow" style={{ minWidth: 0 }}>
                    <b>{idx >= 0 ? `Lesson ${idx + 1} · ` : ""}{docs[idx]?.t ?? s.lesson_title ?? "Lesson"}</b>
                    <div className="mu">{fmt(s.updated_at || s.created_at)}</div>
                  </div>
                  <span className="sch" style={{ color: col[0], background: col[1] }}>{st.label}{s.status === "approved" && s.score != null ? ` · ⭐ ${s.score}/100` : ""}</span>
                  <Link href={`/admin/submissions?q=${encodeURIComponent(u.name)}`} data-testid={`trainee-submission-review-${s.id}`} className="btn g s" style={link}>Review</Link>
                </div>
              );
            })
          )}
        </div>

        <h2 data-testid="admin-trainees-id-h2-2" style={{ margin: "20px 0 10px" }}>🏅 Certificates</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(min(300px,100%),1fr))" }}>
          {CERTS.map((c) => {
            const d = u.certs?.[c.k];
            const inner = (
              <>
                <div className="row">
                  <div className="grow"><h2 data-testid={`trainee-cert-title-${c.k}`} style={{ margin: 0, fontSize: 16 }}>{c.t}</h2><div className="mu">{c.s}</div></div>
                  {d?.earned ? <span className="tag t">🏅 Earned</span> : <span className="tag" style={{ background: "var(--br)", color: "var(--mu)" }}>Not earned yet</span>}
                </div>
                {d?.earned && (
                  <p style={{ marginTop: 10 }}>
                    Earned on <b>{d.date ?? "—"}</b>
                    {d.cid && <> · ID: {d.cid}</>}
                  </p>
                )}
                {d?.earned && (d.url ? <span className="ucv">View certificate <span aria-hidden="true">↗</span></span> : <span className="ucv">No certificate link added</span>)}
              </>
            );
            return d?.earned && d.url ? (
              <a key={c.k} href={d.url} target="_blank" rel="noopener noreferrer" data-testid={`trainee-cert-${c.k}`} aria-label={`Open ${c.t} certificate`} className="card ucard" style={{ borderTop: `4px solid ${c.c}` }}>
                <span hidden data-testid={`trainee-cert-link-${c.k}`} />
                {inner}
              </a>
            ) : (
              <div key={c.k} data-testid={`trainee-cert-${c.k}`} className="card ucard" style={{ borderTop: `4px solid ${c.c}` }}>{inner}</div>
            );
          })}
        </div>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TraineeDetail />
    </Suspense>
  );
}
