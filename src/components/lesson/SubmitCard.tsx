"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATUS, fileName, isDriveLink, subHint, type Submission } from "@/lib/submissions";
import type { Doc, Profile } from "@/lib/types";

const html = (s: string) => ({ __html: s });
const DRIVE_FOLDER = process.env.NEXT_PUBLIC_DRIVE_FOLDER_URL;

const fmt = (d?: string | null) => {
  try { return new Date(d ?? "").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return ""; }
};

function Step({ n, color, icon, title, children }: { n: number; color: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border border-slate-200 p-3.5" style={{ borderTop: `3px solid ${color}`, background: `linear-gradient(180deg, ${color}14, #fff)` }}>
      <div className="flex items-center justify-between">
        <span className="grid h-7 w-7 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: color }}>{n}</span>
        <span className="text-2xl" aria-hidden="true">{icon}</span>
      </div>
      <b>{title}</b>
      <div className="text-sm text-slate-600">{children}</div>
    </div>
  );
}

export default function SubmitCard({ doc, docs, me }: { doc: Doc; docs: Doc[]; me: Profile }) {
  const [sub, setSub] = useState<Submission | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const { data } = await createClient().from("submissions").select("*").eq("user_id", me.id).eq("lesson_id", doc.id).maybeSingle();
    const s = (data as Submission | null) ?? null;
    setSub(s);
    setUrl(s?.url ?? "");
    setNote(s?.note ?? "");
    setLoaded(true);
  }, [me.id, doc.id]);

  useEffect(() => { load(); }, [load]);

  const name = fileName(me, docs, doc);
  const locked = sub?.status === "approved";

  async function submit() {
    setError(""); setOk("");
    const u = url.trim();
    if (!isDriveLink(u)) return setError("Please paste a Google Drive link. It starts with https://drive.google.com or https://docs.google.com");
    setBusy(true);
    const { error } = await createClient().from("submissions").upsert(
      { user_id: me.id, lesson_id: doc.id, lesson_title: doc.t, url: u, note: note.trim(), status: "submitted", updated_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );
    setBusy(false);
    if (error) return setError(`Could not send: ${error.message}`);
    setOk("Submitted! 🎉 Your instructor can now review your work.");
    await load();
  }

  async function cancel() {
    if (!window.confirm("Cancel this submission? Your link and note will be deleted. You can submit again anytime.")) return;
    setError(""); setOk(""); setBusy(true);
    const { data, error } = await createClient().from("submissions").delete().eq("user_id", me.id).eq("lesson_id", doc.id).select();
    setBusy(false);
    if (error || !data?.length) return setError("Could not cancel. Ask your admin to run supabase-fix-submissions.sql.");
    setOk("Submission cancelled. You can submit again anytime.");
    await load();
  }

  async function copyName() {
    try { await navigator.clipboard.writeText(name); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  }

  const st = sub ? STATUS[sub.status] : null;

  return (
    <section id="sb" className="mt-4 scroll-mt-20 border border-slate-200 bg-white p-5 shadow-md" data-testid="submit-card">
      <h2 className="text-lg font-bold">📤 Submit your work</h2>
      <p className="text-sm text-slate-500">Done with this lesson? Send it to your instructor in 3 easy steps.</p>

      {sub && st && (
        <div className={`mt-3 border p-3 text-sm ${sub.status === "approved" ? "border-green-200 bg-green-50" : sub.status === "revise" ? "border-amber-200 bg-amber-50" : "border-indigo-100 bg-indigo-50"}`} data-testid="submit-status-box">
          <span className={`inline-block px-2.5 py-1 text-xs font-bold ${st.cls}`} data-testid="submit-status">{st.label}</span>{" "}
          {sub.status === "approved" && sub.score != null && <b data-testid="submit-score">⭐ {sub.score}/100</b>}{" "}
          <span className="text-slate-500">Sent {fmt(sub.updated_at ?? sub.created_at)}</span>
          {sub.feedback && <div className="mt-2" data-testid="submit-feedback"><b>Instructor feedback:</b><br />{sub.feedback}</div>}
          <div className="mt-1.5"><a href={sub.url} target="_blank" rel="noopener noreferrer" data-testid="submit-view-link" className="font-semibold text-indigo-600 underline">View what you sent ↗</a></div>
        </div>
      )}

      {locked ? (
        <div className="mt-3 border border-green-200 bg-green-50 p-3 text-green-800" data-testid="submit-locked">🎉 Your work is approved and locked. Great job!</div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Step n={1} color="#6d5efc" icon="📝" title="Make one file">
              <span dangerouslySetInnerHTML={html("Take screenshots of your test case (<b>Manual</b> and <b>Script</b> tabs) and your files. Put them all in one document.")} />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-slate-500">Save it as</span>
                <code className="break-all bg-indigo-50 px-2 py-0.5 text-[13px] font-semibold text-indigo-700" data-testid="submit-filename-hint">{name}</code>
                <button type="button" onClick={copyName} data-testid="submit-copy-name-button" className="bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{copied ? "✓ Copied" : "📋 Copy"}</button>
              </div>
              {!me.info?.team && <div className="mt-1 text-xs text-slate-500">Pick your tribe in your Profile first.</div>}
            </Step>
            <Step n={2} color="#14a37f" icon="📁" title="Upload to Drive">
              <span dangerouslySetInnerHTML={html("Upload your file to our Drive folder. Then right-click it, choose <b>Share</b> and <b>Copy link</b>.")} />
              {DRIVE_FOLDER && (
                <div className="mt-2"><a href={DRIVE_FOLDER} target="_blank" rel="noopener noreferrer" data-testid="submit-drive-folder-link" className="inline-block bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">Open Drive folder ↗</a></div>
              )}
            </Step>
            <Step n={3} color="#f59e0b" icon="🔗" title="Paste the link">
              <span dangerouslySetInnerHTML={html("Paste your link below and press <b>Submit</b>. Your instructor will review it.")} />
            </Step>
          </div>

          <details className="mt-3 border border-slate-200" data-testid="submit-examples">
            <summary className="cursor-pointer p-2.5 font-semibold">💡 What should I include? See examples</summary>
            <div className="px-3.5 pb-3 text-sm text-slate-600">
              <p><b>For this lesson:</b> <span dangerouslySetInnerHTML={html(subHint(doc))} /></p>
              <p className="mt-1">You can also add Groovy scripts, a zip file or an Excel sheet to the same Drive folder.</p>
            </div>
          </details>

          <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs">🔒 Hide passwords, API keys and tokens before you take screenshots.</p>

          <div className="mt-3 grid gap-1.5">
            <label htmlFor="sbu" className="text-sm font-semibold">Your Google Drive link</label>
            <input id="sbu" type="url" inputMode="url" maxLength={500} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/..." disabled={!loaded} data-testid="submit-link-input" className="w-full border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
            <details className="border border-slate-200" open={!!note}>
              <summary className="cursor-pointer p-2 text-sm">＋ Add a note for your instructor (optional)</summary>
              <textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything your instructor should know?" data-testid="submit-note-input" className="w-full border-t border-slate-200 p-2 outline-none" />
            </details>
            {error && <p role="alert" className="text-sm font-medium text-red-600" data-testid="submit-error">{error}</p>}
            {ok && <p className="text-sm font-medium text-teal-700" data-testid="submit-success">{ok}</p>}
            <div className="flex flex-wrap gap-2">
              <button onClick={submit} disabled={busy || !loaded} data-testid="submit-button" className="bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-300/50 disabled:opacity-60">{sub ? "Resubmit" : "Submit my work"}</button>
              {sub && <button onClick={cancel} disabled={busy} data-testid="submit-cancel-button" className="border border-red-300 bg-red-50 px-4 py-2.5 font-semibold text-red-700 disabled:opacity-60">🗑️ Cancel submission</button>}
            </div>
            {sub && <p className="text-xs text-slate-500">Want to change something? Edit the link or note, then press Resubmit. Or cancel to delete your submission.</p>}
          </div>
        </>
      )}
    </section>
  );
}
