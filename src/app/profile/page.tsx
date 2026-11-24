"use client";

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

const box = "border border-slate-200 bg-white p-5 shadow-md";
const field = "mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-slate-900";
const lbl = "text-sm font-semibold text-slate-700";
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

  const meId = data?.me.id;
  useEffect(() => {
    if (!meId) return;
    createClient().from("submissions").select("*").eq("user_id", meId).order("updated_at", { ascending: false }).then(({ data: rows }) => setSubs((rows as Submission[]) ?? []));
  }, [meId]);

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

  if (!data || !form) return <main className="p-8 text-slate-500">Loading…</main>;
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

  return (
    <>
      <AppHeader active="/profile" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <section className="overflow-hidden border border-slate-200 bg-white shadow-md" data-testid="profile-header">
          <div className="h-20 bg-gradient-to-r from-indigo-500 to-teal-400" />
          <div className="flex flex-wrap items-end gap-4 px-5 pb-4">
            <div className="relative -mt-9 rounded-full border-4 border-white bg-white">
              <Avatar name={me.name} size={72} src={str(info.avatar) || null} />
              <label title="Change photo" className="absolute -right-1 -bottom-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white text-sm shadow-md">
                📷
                <input type="file" accept="image/*" className="hidden" data-testid="profile-avatar-input" aria-label="Change photo" onChange={(e) => { setPhoto(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-extrabold text-slate-900" data-testid="profile-name">{me.name}</h1>
              <p className="text-slate-500" data-testid="profile-subtitle">{str(info.title) || "KT Academy member"}{str(info.team) ? ` · ${str(info.team)}` : ""}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 text-xs font-semibold ${admin ? "bg-amber-100 text-amber-800" : "bg-indigo-50 text-indigo-700"}`} data-testid="profile-role">{admin ? "Admin" : "Trainee"}</span>
                <span className="bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800" data-testid="profile-track">{me.track} track</span>
                {str(info.avatar) && <button type="button" onClick={removePhoto} data-testid="profile-avatar-remove" className="text-sm font-semibold text-indigo-600 underline">Remove photo</button>}
                {since && <span className="text-slate-500">Member since {since}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-200 text-center">
            <div className="p-3"><b className="block text-xl text-slate-900" data-testid="profile-stat-docs">{lessonsDone(me, docs)}/{active.length}</b><span className="text-xs text-slate-500">Lessons</span></div>
            <div className="border-x border-slate-200 p-3"><b className="block text-xl text-slate-900" data-testid="profile-stat-progress">{overallProgress(me, docs)}%</b><span className="text-xs text-slate-500">Progress</span></div>
            <div className="p-3"><b className="block text-xl text-slate-900" data-testid="profile-stat-certs">{certsEarned(me)}/{CERTS.length}</b><span className="text-xs text-slate-500">Certificates</span></div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <section className={box}>
            <h2 className="mb-3 text-lg font-bold text-slate-900">Personal details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className={lbl} htmlFor="p-name">Full name</label><input id="p-name" value={form.name} onChange={(e) => up("name", e.target.value)} data-testid="profile-name-input" className={field} /></div>
              <div><label className={lbl} htmlFor="p-email">Email</label><input id="p-email" value={me.email} disabled data-testid="profile-email-input" className={field} /></div>
              <div><label className={lbl} htmlFor="p-title">Job title</label><input id="p-title" maxLength={60} placeholder="e.g. Manual Tester" value={form.title} onChange={(e) => up("title", e.target.value)} data-testid="profile-title-input" className={field} /></div>
              {!admin && (
                <div>
                  <label className={lbl} htmlFor="p-tribe">Tribe</label>
                  <select id="p-tribe" value={form.team} onChange={(e) => up("team", e.target.value)} data-testid="profile-tribe-select" className={field}>
                    <option value="">Select your tribe</option>
                    {ALL_TRIBES.map((t) => <option key={t}>{t}</option>)}
                    {form.team && !ALL_TRIBES.includes(form.team) && <option>{form.team}</option>}
                  </select>
                </div>
              )}
              {!admin && (
                <>
                  <div>
                    <label className={lbl} htmlFor="p-level">Katalon experience</label>
                    <select id="p-level" value={form.level} onChange={(e) => up("level", e.target.value)} data-testid="profile-level-select" className={field}>
                      {LEVELS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl} htmlFor="p-track">Learning track</label>
                    <select id="p-track" value={form.track} onChange={(e) => up("track", e.target.value)} data-testid="profile-track-select" className={field}>
                      {TRACKS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl} htmlFor="p-goal">My learning goal</label>
                    <textarea id="p-goal" rows={2} maxLength={200} placeholder="What do you want to achieve with Katalon?" value={form.goal} onChange={(e) => up("goal", e.target.value)} data-testid="profile-goal-input" className={field} />
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <label className={lbl} htmlFor="p-about">About me</label>
                <textarea id="p-about" rows={3} maxLength={300} placeholder="A short intro for your team" value={form.about} onChange={(e) => up("about", e.target.value)} data-testid="profile-about-input" className={field} />
              </div>
            </div>
            {error && <p className="mt-3 text-sm font-semibold text-red-600" data-testid="profile-error">{error}</p>}
            {ok && <p className="mt-3 text-sm font-semibold text-green-700" data-testid="profile-success">{ok}</p>}
            <button type="button" onClick={save} disabled={busy} data-testid="profile-save-button" className="mt-4 bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60">
              {busy ? "Saving…" : "Save changes"}
            </button>
          </section>

          <aside className="flex flex-col gap-4">
            {!admin && (
              <section className={box} data-testid="profile-submissions">
                <h2 className="mb-3 text-lg font-bold text-slate-900">📤 My submissions</h2>
                {subs.length === 0 ? (
                  <p className="text-sm text-slate-500" data-testid="profile-submissions-empty">You have not submitted any work yet. Open a lesson and scroll to <b>Submit your work</b>.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {subs.map((s) => {
                      const idx = docs.findIndex((d) => d.id === Number(s.lesson_id));
                      const doc = docs[idx];
                      const st = STATUS[s.status];
                      return (
                        <li key={s.id} data-testid={`profile-submission-row-${s.lesson_id}`} className="flex items-center gap-2 border border-slate-200 p-2.5">
                          <div className="min-w-0 flex-1">
                            <b className="block truncate text-sm text-slate-900">{idx >= 0 ? `Lesson ${idx + 1} · ` : ""}{doc?.t ?? "Lesson"}</b>
                            <span className="text-xs text-slate-500">{fmt(s.updated_at || s.created_at)}</span>
                          </div>
                          <span className={`whitespace-nowrap px-2 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}{s.status === "approved" && s.score != null ? ` · ${s.score}` : ""}</span>
                          <Link href={`/lessons/${s.lesson_id}`} data-testid={`profile-submission-open-${s.lesson_id}`} className="text-sm font-semibold text-indigo-600 underline">Open</Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
            <section className={box}>
              <h2 className="mb-1 text-lg font-bold text-slate-900">Security</h2>
              <p className="mb-3 text-sm text-slate-500">Your password is locked. Confirm your current password to change it.</p>
              <button type="button" onClick={() => setPw(true)} data-testid="profile-change-password-button" className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">🔒 Change password</button>
            </section>
            <section className={box}>
              <h2 className="mb-3 text-lg font-bold text-slate-900">Appearance</h2>
              <div className="flex gap-2">
                {(["light", "dark"] as Theme[]).map((t) => (
                  <button key={t} type="button" onClick={() => setTheme(t)} data-testid={`theme-${t}-button`} aria-pressed={theme === t}
                    className={`border px-4 py-2 text-sm font-semibold ${theme === t ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-700"}`}>
                    {t === "light" ? "☀ Light" : "🌙 Dark"}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
      {pw && <PasswordModal email={me.email} onClose={() => setPw(false)} />}
    </>
  );
}
