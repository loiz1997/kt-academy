"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/dashboard/Avatar";
import PasswordModal from "@/components/profile/PasswordModal";
import { CERTS } from "@/lib/certs";
import { activeDocs } from "@/lib/lessons";
import { certsEarned, lessonsDone, overallProgress } from "@/lib/progress";
import { squareShrink } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { STATUS, type Submission } from "@/lib/submissions";
import { currentTheme, setTheme, type Theme } from "@/lib/theme";
import { ALL_TRIBES, LEVELS, TRACKS } from "@/lib/tribes";
import type { Profile } from "@/lib/types";
import { useAppData } from "@/lib/use-app-data";
import { useLibrary } from "@/lib/library";

const SCOLOR: Record<string, string> = { submitted: "#f59e0b", approved: "#16a36a", revise: "#e5484d" };
const SCHIP: Record<string, [string, string]> = { submitted: ["#92400e", "#fef3c7"], approved: ["#166534", "#dcfce7"], revise: ["#991b1b", "#fee2e2"] };
const str = (v: unknown) => (typeof v === "string" ? v : "");
const fmt = (d?: string | null) => {
  try { return new Date(d ?? "").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return ""; }
};

export default function ProfilePage() {
  const { data, saveProfile } = useAppData(false);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [pw, setPw] = useState(false);
  const [theme, setT] = useState<Theme>("light");
  const [form, setForm] = useState<{ name: string; title: string; team: string; level: string; track: string; goal: string; about: string } | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [traineeN, setTraineeN] = useState(0);
  const lib = useLibrary();

  const meId = data?.me.id;
  useEffect(() => {
    if (!meId) return;
    createClient().from("submissions").select("*").eq("user_id", meId).order("updated_at", { ascending: false }).then(({ data: rows }) => setSubs((rows as Submission[]) ?? []));
  }, [meId]);

  const isAdmin = data?.me.role === "admin";
  useEffect(() => {
    if (!isAdmin) return;
    createClient().from("profiles").select("id", { count: "exact", head: true }).eq("role", "user").then(({ count }) => setTraineeN(count ?? 0));
  }, [isAdmin]);

  useEffect(() => {
    const sync = () => setT(currentTheme());
    window.addEventListener("kt-theme", sync);
    sync();
    return () => window.removeEventListener("kt-theme", sync);
  }, []);

  useEffect(() => {
    if (!data || form) return;
    const { me } = data;
    const i = me.info ?? {};
    setForm({ name: me.name ?? "", title: str(i.title), team: str(i.team), level: str(i.level) || "Beginner", track: me.track, goal: str(i.goal), about: str(i.about) });
  }, [data, form]);

  if (!data || !form) return <PageLoading />;
  const { me, docs } = data;
  const admin = me.role === "admin";
  const info = me.info ?? {};
  const up = (k: keyof typeof form, v: string) => { setForm({ ...form, [k]: v }); setOk(""); };
  const active = activeDocs(docs);
  const created = (me as Profile & { created_at?: string }).created_at;
  const since = created ? new Date(created).toLocaleDateString(undefined, { year: "numeric", month: "long" }) : "";

  async function setPhoto(file: File | undefined) {
    setError(""); setOk("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file (JPG or PNG).");
    if (file.size > 10e6) return setError("That image is too big (max 10 MB).");
    try {
      const avatar = await squareShrink(file);
      if (!(await saveProfile({ name: me.name, info: { avatar } }))) setError("Could not save the photo. Please try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the photo.");
    }
  }
  async function removePhoto() {
    setError(""); setOk("");
    if (!(await saveProfile({ name: me.name, info: { avatar: undefined } }))) setError("Could not remove the photo.");
  }

  async function save() {
    if (!form) return;
    setError(""); setOk("");
    const name = form.name.trim();
    if (!name) return setError("Please enter your name.");
    setBusy(true);
    const extra: Record<string, unknown> = admin
      ? { title: form.title.trim().slice(0, 60), about: form.about.trim().slice(0, 300) }
      : { title: form.title.trim().slice(0, 60), team: form.team.trim().slice(0, 60), level: form.level, goal: form.goal.trim().slice(0, 200), about: form.about.trim().slice(0, 300) };
    const saved = await saveProfile({ name, track: admin ? undefined : (form.track as Profile["track"]), info: extra });
    setBusy(false);
    if (saved) setOk("Saved ✓");
    else setError("Could not save. Please try again.");
  }

  const lessons = lessonsDone(me, docs);
  const prog = overallProgress(me, docs);
  const certs = certsEarned(me);
  const C = 2 * Math.PI * 26;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const nv = (lib.items ?? []).filter((x) => x.kind === "video").length;
  const nd = (lib.items ?? []).filter((x) => x.kind === "doc").length;
  const tiles: { id: string; icon: string; val: string; label: string; w: number; a: string; b: string }[] = admin ? [
    { id: "profile-stat-trainees", icon: "👥", val: String(traineeN), label: "Trainees", w: traineeN ? 100 : 0, a: "#6d5efc", b: "#8b5cf6" },
    { id: "profile-stat-videos", icon: "🎬", val: String(nv), label: "Videos", w: nv ? 100 : 0, a: "#0ea5e9", b: "#14c8b4" },
    { id: "profile-stat-docs", icon: "📄", val: String(nd), label: "Documents", w: nd ? 100 : 0, a: "#f59e0b", b: "#f97316" },
  ] : [
    { id: "profile-stat-docs", icon: "📘", val: `${lessons}/${active.length}`, label: "Lessons", w: pct(lessons, active.length), a: "#6d5efc", b: "#8b5cf6" },
    { id: "profile-stat-progress", icon: "🚀", val: `${prog}%`, label: "Progress", w: prog, a: "#0ea5e9", b: "#14c8b4" },
    { id: "profile-stat-certs", icon: "🏅", val: `${certs}/${CERTS.length}`, label: "Certificates", w: pct(certs, CERTS.length), a: "#f59e0b", b: "#f97316" },
  ];
  const Count = ({ v, max }: { v: string; max: number }) => <span className="pf-cnt">{v.length}/{max}</span>;

  return (
    <>
      <AppHeader active="/profile" />
      <main>
        <section className="pf-hero" data-testid="profile-header">
          <div className="pf-ban">
            {!admin && <div className="pf-ring" aria-label={`Overall progress ${prog}%`}>
              <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
                <circle className="t" cx="30" cy="30" r="26" fill="none" strokeWidth="6" />
                <circle className="v" cx="30" cy="30" r="26" fill="none" strokeWidth="6" strokeDasharray={C} strokeDashoffset={C * (1 - prog / 100)} />
              </svg>
              <div><b>{prog}%</b><span>Overall</span></div>
            </div>}
          </div>
          <div className="pf-id">
            <div className="pf-av">
              <div><Avatar name={me.name} size={100} src={str(info.avatar) || null} /></div>
              <label title="Change photo" className="pf-cam">
                📷
                <input type="file" accept="image/*" className="hidden" data-testid="profile-avatar-input" aria-label="Change photo" onChange={(e) => { setPhoto(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            </div>
            <div className="pf-nm">
              <h1 data-testid="profile-name">{me.name}</h1>
              <p data-testid="profile-subtitle">{str(info.title) || (admin ? "KT Academy admin" : "KT Academy member")}{str(info.team) ? ` · ${str(info.team)}` : ""}</p>
              <div className="pf-chips">
                <span className={`pf-chip ${admin ? "wa" : ""}`} data-testid="profile-role">{admin ? "👑 Admin" : "🎓 Trainee"}</span>
                {admin ? <span className="pf-chip mu" data-testid="profile-account">Account: Admin</span> : <span className="pf-chip ok" data-testid="profile-track">{me.track} track</span>}
                {!admin && str(info.level) && <span className="pf-chip mu">⚡ {str(info.level)}</span>}
                {since && <span className="pf-chip mu">📅 Member since {since}</span>}
                {str(info.avatar) && <button type="button" onClick={removePhoto} data-testid="profile-avatar-remove" className="pf-link">Remove photo</button>}
              </div>
            </div>
          </div>
          <div className="pf-stats">
            {tiles.map((t) => (
              <div key={t.id} className="pf-st" style={{ "--a": t.a, "--b": t.b } as React.CSSProperties}>
                <div className="pf-si" aria-hidden="true">{t.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b data-testid={t.id}>{t.val}</b>
                  <span>{t.label}</span>
                  <div className="pf-mb"><i style={{ width: `${t.w}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pf-grid">
          <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
          <section className="pf-card">
            <h2>{admin ? "Admin details" : "Personal details"}</h2>
            <p className="pf-sub">{admin ? "Your name and intro, as your trainees see them." : "Keep this up to date so your team and instructor know who you are."}</p>
            <div className="pf-f">
              <div className="pf-sec full">Basics</div>
              <div><label htmlFor="p-name">Full name</label><input id="p-name" value={form.name} onChange={(e) => up("name", e.target.value)} data-testid="profile-name-input" /></div>
              <div><label htmlFor="p-email">Email</label><input id="p-email" value={me.email} disabled data-testid="profile-email-input" /></div>
              <div><label htmlFor="p-title">Job title</label><input id="p-title" maxLength={60} placeholder={admin ? "e.g. Automation Senior Lead" : "e.g. Manual Tester"} value={form.title} onChange={(e) => up("title", e.target.value)} data-testid="profile-title-input" /></div>
              {admin && <div><label htmlFor="p-account">Account</label><input id="p-account" value="Admin" disabled data-testid="profile-account-input" /></div>}
              {!admin && (
                <div>
                  <label htmlFor="p-tribe">Tribe</label>
                  <select id="p-tribe" value={form.team} onChange={(e) => up("team", e.target.value)} data-testid="profile-tribe-select">
                    <option value="">Select your tribe</option>
                    {ALL_TRIBES.map((t) => <option key={t}>{t}</option>)}
                    {form.team && !ALL_TRIBES.includes(form.team) && <option>{form.team}</option>}
                  </select>
                </div>
              )}
              {!admin && (
                <>
                  <div className="pf-sec full">Learning</div>
                  <div>
                    <label htmlFor="p-level">Katalon experience</label>
                    <select id="p-level" value={form.level} onChange={(e) => up("level", e.target.value)} data-testid="profile-level-select">
                      {LEVELS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="p-track">Learning track</label>
                    <select id="p-track" value={form.track} onChange={(e) => up("track", e.target.value)} data-testid="profile-track-select">
                      {TRACKS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="full">
                    <label htmlFor="p-goal">My learning goal <Count v={form.goal} max={200} /></label>
                    <textarea id="p-goal" rows={2} maxLength={200} placeholder="What do you want to achieve with Katalon?" value={form.goal} onChange={(e) => up("goal", e.target.value)} data-testid="profile-goal-input" />
                  </div>
                </>
              )}
              <div className="pf-sec full">About</div>
              <div className="full">
                <label htmlFor="p-about">About me <Count v={form.about} max={300} /></label>
                <textarea id="p-about" rows={3} maxLength={300} placeholder={admin ? "A short intro for your trainees" : "A short intro for your team"} value={form.about} onChange={(e) => up("about", e.target.value)} data-testid="profile-about-input" />
              </div>
            </div>
            <div className="pf-save">
              <button type="button" onClick={save} disabled={busy} data-testid="profile-save-button" className="btn">{busy ? "Saving…" : "Save changes"}</button>
              {error && <span className="msg" style={{ margin: 0, minHeight: 0 }} role="alert" data-testid="profile-error">{error}</span>}
              {ok && <span style={{ color: "var(--ok)", fontWeight: 700, fontSize: 14 }} data-testid="profile-success">{ok}</span>}
            </div>
          </section>

          {admin && (
            <section className="pf-card" data-testid="profile-certificates">
              <h2>🏅 My certificates</h2>
              {CERTS.map((c) => {
                const d = me.certs?.[c.k];
                return (
                  <div key={c.k} className="mrow" data-testid={`profile-cert-${c.k}`}>
                    <div style={{ background: c.c, width: 32, height: 32, display: "grid", placeItems: "center", fontSize: 16, opacity: d?.earned ? 1 : 0.45, flex: "none" }}>🏅</div>
                    <div className="grow" style={{ fontSize: 14, minWidth: 0 }}>
                      <b>{c.t.replace(" Certification", "")}</b>
                      <div className="mu">{d?.earned ? `Earned ${d.date ?? ""}` : "Not added yet"}</div>
                    </div>
                    {d?.earned && d.url && <a className="btn g s" href={d.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>View</a>}
                    <Link className="btn g s" href={`/certifications/${c.k}`} data-testid={`profile-cert-edit-${c.k}`} style={{ textDecoration: "none" }}>{d?.earned ? "Edit" : "Add"}</Link>
                  </div>
                );
              })}
            </section>
          )}
          </div>

          <aside style={{ display: "grid", gap: 18 }}>
            {!admin && (
              <section className="pf-card" data-testid="profile-submissions">
                <h2>📤 My submissions</h2>
                <p className="pf-sub">Your work, and what your instructor said.</p>
                {subs.length === 0 ? (
                  <div className="pf-empty" data-testid="profile-submissions-empty">
                    <span className="e" aria-hidden="true">📭</span>
                    <span>You have not submitted any work yet. Open a lesson and scroll to <b>Submit your work</b>.</span>
                  </div>
                ) : (
                  <div>
                    {subs.map((s) => {
                      const idx = docs.findIndex((d) => d.id === Number(s.lesson_id));
                      const doc = docs[idx];
                      const st = STATUS[s.status];
                      const [fg, bg] = SCHIP[s.status];
                      return (
                        <div key={s.id} data-testid={`profile-submission-row-${s.lesson_id}`} className="pf-sr" style={{ "--c": SCOLOR[s.status] } as React.CSSProperties}>
                          <div className="grow" style={{ minWidth: 0 }}>
                            <b>{idx >= 0 ? `Lesson ${idx + 1} · ` : ""}{doc?.t ?? "Lesson"}</b>
                            <small>{fmt(s.updated_at || s.created_at)}</small>
                          </div>
                          <span className="sch" style={{ color: fg, background: bg }}>{st.label}{s.status === "approved" && s.score != null ? ` · ${s.score}` : ""}</span>
                          <Link href={`/lessons/${s.lesson_id}`} data-testid={`profile-submission-open-${s.lesson_id}`} className="btn g s">Open</Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
            <section className="pf-card">
              <h2>Security</h2>
              <p className="pf-sub">Your password is locked. Confirm your current password to change it.</p>
              <button type="button" onClick={() => setPw(true)} data-testid="profile-change-password-button" className="btn g">🔒 Change password</button>
            </section>
            {admin && (
              <section className="pf-card" data-testid="profile-admin-shortcuts">
                <h2>Admin shortcuts</h2>
                <div className="row">
                  <Link href="/admin" className="btn g s" data-testid="profile-shortcut-dashboard" style={{ textDecoration: "none" }}>📊 Dashboard</Link>
                  <Link href="/learn" className="btn g s" data-testid="profile-shortcut-learning" style={{ textDecoration: "none" }}>📚 Manage learning</Link>
                </div>
              </section>
            )}
            <section className="pf-card">
              <div className="pf-ap">
                <h2 style={{ margin: 0 }}>Appearance</h2>
                <div className="pf-ic" role="group" aria-label="Theme">
                  {(["light", "dark"] as Theme[]).map((t) => (
                    <button key={t} type="button" onClick={() => setTheme(t)} data-testid={`theme-${t}-button`} aria-pressed={theme === t} aria-label={t === "light" ? "Light mode" : "Dark mode"} title={t === "light" ? "Light mode" : "Dark mode"} className={`pf-ib ${theme === t ? "on" : ""}`}>
                      {t === "light" ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
      {pw && <PasswordModal email={me.email} onClose={() => setPw(false)} />}
    </>
  );
}
