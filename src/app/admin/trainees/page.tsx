"use client";

import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/dashboard/Avatar";
import { trainees as onlyTrainees, useAdminData } from "@/lib/admin-data";
import { CERTS } from "@/lib/certs";
import { certsEarned, overallProgress } from "@/lib/progress";
import { ALL_TRIBES } from "@/lib/tribes";
import type { Profile } from "@/lib/types";

const field = "border border-slate-300 bg-white px-3 py-2 text-slate-900";
const C = 2 * Math.PI * 29;

function Menu({ u, onRole, onRemove }: { u: Profile; onRole: () => void; onRemove: () => void }) {
  return (
    <details className="relative" data-testid={`trainee-menu-${u.id}`}>
      <summary aria-label="More actions" title="More actions" className="grid h-8 w-8 cursor-pointer list-none place-items-center border border-slate-200 text-lg text-slate-600">⋯</summary>
      <div className="absolute right-0 z-20 mt-1 flex w-40 flex-col border border-slate-200 bg-white shadow-lg">
        <button type="button" onClick={onRole} data-testid={`trainee-${u.role === "admin" ? "make-user" : "make-admin"}-${u.id}`} className="px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Make {u.role === "admin" ? "user" : "admin"}
        </button>
        <button type="button" onClick={onRemove} data-testid={`trainee-remove-${u.id}`} className="px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-slate-100">Remove</button>
      </div>
    </details>
  );
}

export default function TraineesPage() {
  const { data, reload, setRole, removeUser } = useAdminData();
  const [q, setQ] = useState("");
  const [tf, setTf] = useState("");
  const [msg, setMsg] = useState("");

  if (!data) return <main className="p-8 text-slate-500">Loading…</main>;
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

  return (
    <>
      <AppHeader active="/admin/trainees" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900" data-testid="trainees-title">🎓 Trainees &amp; Certificates</h1>
            <p className="text-slate-500" data-testid="trainees-summary">{tr.length} trainee{s(tr.length)} · {holders} certified · {total} certificate{s(total)} earned</p>
          </div>
          <button type="button" onClick={reload} data-testid="trainees-refresh-button" className="border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">↻ Refresh</button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search name, email or tribe" aria-label="Search" data-testid="trainees-search-input" className={`${field} min-w-[200px] max-w-sm flex-1`} />
          <select value={tf} onChange={(e) => setTf(e.target.value)} aria-label="Filter by tribe" data-testid="trainees-tribe-select" className={`${field} min-w-[150px] max-w-[220px] flex-1`}>
            <option value="">All tribes</option>
            {["Admin", ...ALL_TRIBES].map((t) => <option key={t}>{t}</option>)}
            <option value="__none">Not selected yet</option>
          </select>
        </div>
        {msg && <p className="mb-3 text-sm font-semibold text-red-600" data-testid="trainees-error">{msg}</p>}

        {list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((u) => {
              const p = overallProgress(u, docs);
              const n = certsEarned(u);
              return (
                <article key={u.id} data-testid={`trainee-card-${u.id}`} className="border border-slate-200 bg-white p-4 shadow-md" style={n === CERTS.length ? { borderTop: "4px solid #f5b301" } : undefined}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0">
                      <svg viewBox="0 0 64 64" className="absolute inset-0" aria-hidden="true">
                        <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(80,90,150,.2)" strokeWidth="4" />
                        <circle cx="32" cy="32" r="29" fill="none" stroke="#6d5efc" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${((C * p) / 100).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 32 32)" />
                      </svg>
                      <span className="absolute inset-0 grid place-items-center"><Avatar name={u.name} size={44} src={typeof u.info?.avatar === "string" ? u.info.avatar : null} /></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-slate-900" data-testid={`trainee-name-${u.id}`}>{u.name}</b>
                      <span className="text-sm text-slate-500">{tribe(u) || "No tribe yet"} · {p}%</span>
                    </div>
                    <Menu u={u} onRole={() => changeRole(u)} onRemove={() => remove(u)} />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5" aria-label={`${n} of ${CERTS.length} certificates earned`}>
                    {CERTS.map((c) => {
                      const e = !!u.certs?.[c.k]?.earned;
                      return <span key={c.k} title={`${c.t} — ${e ? "earned" : "not yet"}`} className="grid h-7 w-7 place-items-center text-sm" style={e ? { background: c.c, color: "#fff" } : { background: "rgba(148,163,184,.25)", filter: "grayscale(1)", opacity: 0.6 }}>🏅</span>;
                    })}
                    <span className="ml-auto text-sm text-slate-500"><b className="text-slate-900">{n}</b>/{CERTS.length}</span>
                  </div>
                  <Link href={`/admin/trainees/${u.id}`} data-testid={`trainee-view-${u.id}`} className="mt-3 block border border-slate-300 py-1.5 text-center text-sm font-semibold text-slate-700">View certificates →</Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-md" data-testid="trainees-empty">Nobody matches your search.</div>
        )}

        {admins.length > 0 && (
          <>
            <h2 className="mt-6 mb-2 text-lg font-bold text-slate-900">🛠 Admins <span className="text-sm font-normal text-slate-500">{admins.length}</span></h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {admins.map((u) => (
                <div key={u.id} data-testid={`admin-row-${u.id}`} className="flex items-center gap-3 border border-slate-200 bg-white p-3 shadow-md">
                  <Avatar name={u.name} size={36} src={typeof u.info?.avatar === "string" ? u.info.avatar : null} />
                  <div className="min-w-0 flex-1"><b className="block truncate text-slate-900">{u.name}</b><span className="text-sm text-slate-500">{u.id === me.id ? "You" : "Admin"}</span></div>
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
