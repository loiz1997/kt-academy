"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Av from "@/components/dashboard/Av";
import { trainees as onlyTrainees, useAdminData } from "@/lib/admin-data";
import { CERTS } from "@/lib/certs";
import { certsEarned, overallProgress } from "@/lib/progress";
import { ALL_TRIBES } from "@/lib/tribes";
import type { Profile } from "@/lib/types";

const C = 2 * Math.PI * 29;
const av = (u: Profile) => (typeof u.info?.avatar === "string" ? u.info.avatar : null);

function Menu({ u, onRole, onRemove }: { u: Profile; onRole: () => void; onRemove: () => void }) {
  return (
    <details className="tmn" data-testid={`trainee-menu-${u.id}`}>
      <summary aria-label="More actions" title="More actions">⋯</summary>
      <div className="tmb">
        <button type="button" onClick={onRole} data-testid={`trainee-${u.role === "admin" ? "make-user" : "make-admin"}-${u.id}`}>Make {u.role === "admin" ? "user" : "admin"}</button>
        <button type="button" className="dg" onClick={onRemove} data-testid={`trainee-remove-${u.id}`}>Remove</button>
      </div>
    </details>
  );
}

export default function TraineesPage() {
  const { data, reload, setRole, removeUser } = useAdminData();
  const [q, setQ] = useState("");
  const [tf, setTf] = useState("");
  const [msg, setMsg] = useState("");
  const [spin, setSpin] = useState(false);

  if (!data) return <PageLoading />;
  const { me, docs, users } = data;
  const tribe = (u: Profile) => (u.role === "admin" ? "Admin" : String(u.info?.team ?? ""));
  const ql = q.trim().toLowerCase();
  const match = (u: Profile) =>
    (!tf || tribe(u) === tf || (tf === "__none" && !tribe(u))) && `${u.name} ${u.email} ${tribe(u)}`.toLowerCase().includes(ql);
  const tr = onlyTrainees(users);
  const list = tr.filter(match).sort((a, b) => certsEarned(b) - certsEarned(a) || overallProgress(b, docs) - overallProgress(a, docs) || a.name.localeCompare(b.name));
  const admins = users.filter((u) => u.role === "admin").filter(match);
  const holders = tr.filter((u) => certsEarned(u) > 0).length;
  const total = tr.reduce((s, u) => s + certsEarned(u), 0);
  const s = (n: number) => (n === 1 ? "" : "s");

  async function changeRole(u: Profile) {
    const to = u.role === "admin" ? "user" : "admin";
    if (!confirm(`Make ${u.name} ${to === "admin" ? "an admin" : "a trainee"}?`)) return;
    setMsg(await setRole(u.id, to));
  }
  async function remove(u: Profile) {
    if (!confirm(`Remove ${u.name}? Their profile and submissions are deleted. This cannot be undone.`)) return;
    setMsg(await removeUser(u.id));
  }

  async function refresh() {
    setSpin(true);
    await reload();
    setTimeout(() => setSpin(false), 400);
  }

  return (
    <>
      <AppHeader active="/admin/trainees" />
      <main data-testid="admin-trainees-main-1">
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6d5efc" /><stop offset="1" stopColor="#14c8b4" /></linearGradient></defs></svg>
        <section data-testid="admin-trainees-section-1" className="phd">
          <div className="grow">
            <h1 data-testid="trainees-title">🎓 Trainees &amp; Certificates</h1>
            <p className="mu" data-testid="trainees-summary">{tr.length} trainee{s(tr.length)} · {holders} certified · {total} certificate{s(total)} earned</p>
          </div>
          <button type="button" className="btn g s" onClick={refresh} data-testid="trainees-refresh-button" aria-label="Refresh" title="Refresh trainees and progress"><span className={`rfb${spin ? " rot" : ""}`}>↻</span> Refresh</button>
        </section>

        <div className="row pfl">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search name, email or tribe" aria-label="Search" data-testid="trainees-search-input" />
          <select value={tf} onChange={(e) => setTf(e.target.value)} aria-label="Filter by tribe" data-testid="trainees-tribe-select">
            <option value="">All tribes</option>
            {["Admin", ...ALL_TRIBES].map((t) => <option key={t}>{t}</option>)}
            <option value="__none">Not selected yet</option>
          </select>
        </div>
        {msg && <p className="msg" style={{ color: "var(--dn)", fontWeight: 600 }} data-testid="trainees-error">{msg}</p>}

        {list.length ? (
          <div className="tgd">
            {list.map((u) => {
              const p = overallProgress(u, docs);
              const n = certsEarned(u);
              return (
                <article key={u.id} data-testid={`trainee-card-${u.id}`} className={`tcd${n === CERTS.length ? " full" : ""}`}>
                  <div className="tct">
                    <div className="trg">
                      <svg viewBox="0 0 64 64" aria-hidden="true">
                        <circle cx="32" cy="32" r="29" fill="none" stroke="var(--br)" strokeWidth="4" />
                        <circle cx="32" cy="32" r="29" fill="none" stroke="url(#tg)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${((C * p) / 100).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 32 32)" />
                      </svg>
                      <Av name={u.name} src={av(u)} style={{ width: 48, height: 48, fontSize: 16 }} />
                    </div>
                    <div className="grow tnm">
                      <b data-testid={`trainee-name-${u.id}`}>{u.name}</b>
                      <div className="mu">{tribe(u) || "No tribe yet"} · {p}%</div>
                    </div>
                    <Menu u={u} onRole={() => changeRole(u)} onRemove={() => remove(u)} />
                  </div>
                  <div className="tmd" aria-label={`${n} of ${CERTS.length} certificates earned`}>
                    {CERTS.map((c) => {
                      const e = !!u.certs?.[c.k]?.earned;
                      return (
                        <span key={c.k} className={`md${e ? " on" : ""}`} style={{ "--c": c.c } as React.CSSProperties} title={`${c.t} — ${e ? "earned" : "not yet"}`}>
                          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="5.5" /><path d="m8.7 13.4-1.7 7 5-2.6 5 2.6-1.7-7" /></svg>
                        </span>
                      );
                    })}
                    <span className="mc"><b>{n}</b>/{CERTS.length}</span>
                  </div>
                  <Link href={`/admin/trainees/${u.id}`} data-testid={`trainee-view-${u.id}`} className="tvw">View certificates <span aria-hidden="true">→</span></Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="card mu" style={{ textAlign: "center", padding: 30 }} data-testid="trainees-empty">Nobody matches your search.</div>
        )}

        {admins.length > 0 && (
          <>
            <h2 data-testid="admin-trainees-h2-1" className="tah">🛠 Admins <span className="mu">{admins.length}</span></h2>
            <div className="tags">
              {admins.map((u) => (
                <div key={u.id} data-testid={`admin-row-${u.id}`} className="tad">
                  <Av name={u.name} src={av(u)} style={{ width: 34, height: 34, fontSize: 12 }} />
                  <div className="grow tnm"><b>{u.name}</b><div className="mu">{u.id === me.id ? "You" : "Admin"}</div></div>
                  {u.id !== me.id && <Menu u={u} onRole={() => changeRole(u)} onRemove={() => remove(u)} />}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
