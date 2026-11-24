"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATUS, fileName, isDriveLink, subHint, type Submission } from "@/lib/submissions";
import type { Doc, Profile } from "@/lib/types";

const html = (s: string) => ({ __html: s });
const DRIVE_FOLDER = process.env.NEXT_PUBLIC_DRIVE_FOLDER_URL;

const SCOLOR: Record<string, [string, string]> = { submitted: ["#92400e", "#fef3c7"], approved: ["#166534", "#dcfce7"], revise: ["#991b1b", "#fee2e2"] };

const fmt = (d?: string | null) => {
  try { return new Date(d ?? "").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return ""; }
};

function Step({ n, color, icon, title, children }: { n: number; color: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="swt" style={{ "--c": color } as React.CSSProperties} data-testid={`submit-step-${n}`}>
      <div className="swh"><span className="swn">{n}</span><span className="swi" aria-hidden="true">{icon}</span></div>
      <b>{title}</b>
      {children}
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
    <section id="sb" className="card sub sw scroll-mt-20" data-testid="submit-card">
      <h2 style={{ margin: 0 }}>📤 Submit your work</h2>
      <div className="mu">Done with this lesson? Send it to your instructor in 3 easy steps.</div>

      {sub && st && (
        <div className={`tipb ${sub.status === "approved" ? "" : sub.status === "revise" ? "w" : "nt"}`} style={{ margin: "12px 0" }} data-testid="submit-status-box">
          <span className="sch" data-testid="submit-status" style={{ color: SCOLOR[sub.status][0], background: SCOLOR[sub.status][1] }}>{st.label}</span>{" "}
          {sub.status === "approved" && sub.score != null && <b data-testid="submit-score">⭐ {sub.score}/100</b>}{" "}
          <span className="mu">Sent {fmt(sub.updated_at ?? sub.created_at)}</span>
          {sub.feedback && <div style={{ marginTop: 8 }} data-testid="submit-feedback"><b>Instructor feedback:</b><br />{sub.feedback}</div>}
          <div style={{ marginTop: 6 }}><a href={sub.url} target="_blank" rel="noopener noreferrer" data-testid="submit-view-link">View what you sent ↗</a></div>
        </div>
      )}

      {locked ? (
        <div className="tipb" style={{ marginTop: 14 }} data-testid="submit-locked">🎉 Your work is approved and locked. Great job!</div>
      ) : (
        <>
          <div className="swg">
            <Step n={1} color="#6d5efc" icon="📝" title="Make one file">
              <p dangerouslySetInnerHTML={html("Take screenshots of your test case (<b>Manual</b> and <b>Script</b> tabs) and your files. Put them all in one document.")} />
              <div className="swnm">
                <span className="mu">Save it as</span>
                <code className="fnm" data-testid="submit-filename-hint">{name}</code>
                <button type="button" onClick={copyName} data-testid="submit-copy-name-button" className="btn g s">{copied ? "✓ Copied" : "📋 Copy"}</button>
              </div>
              {!me.info?.team && <div className="mu" style={{ fontSize: 12, marginTop: 4 }}>Pick your tribe in your Profile first.</div>}
            </Step>
            <Step n={2} color="#14a37f" icon="📁" title="Upload to Drive">
              <p dangerouslySetInnerHTML={html("Upload your file to our Drive folder. Then right-click it, choose <b>Share</b> and <b>Copy link</b>.")} />
              {DRIVE_FOLDER && (
                <a href={DRIVE_FOLDER} target="_blank" rel="noopener noreferrer" data-testid="submit-drive-folder-link" className="btn g s" style={{ textDecoration: "none", display: "inline-block" }}>Open Drive folder ↗</a>
              )}
            </Step>
            <Step n={3} color="#f59e0b" icon="🔗" title="Paste the link">
              <p dangerouslySetInnerHTML={html("Paste your link below and press <b>Submit</b>. Your instructor will review it.")} />
            </Step>
          </div>

          <details className="swi2" data-testid="submit-examples">
            <summary>💡 What should I include? See examples</summary>
            <div className="swib">
              <p className="mu" style={{ marginTop: 0 }}><b>For this lesson:</b> <span dangerouslySetInnerHTML={html(subHint(doc))} /></p>
              <p className="mu">You can also add Groovy scripts, a zip file or an Excel sheet to the same Drive folder.</p>
            </div>
          </details>

          <div className="swsec">🔒 Hide passwords, API keys and tokens before you take screenshots.</div>

          <div className="sform">
            <label htmlFor="sbu">Your Google Drive link</label>
            <input id="sbu" type="url" inputMode="url" maxLength={500} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/..." disabled={!loaded} data-testid="submit-link-input" />
            <details className="swnt" open={!!note}>
              <summary>＋ Add a note for your instructor (optional)</summary>
              <textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything your instructor should know?" data-testid="submit-note-input" />
            </details>
            {error && <div className="msg" role="alert" data-testid="submit-error">{error}</div>}
            {ok && <div className="msg" style={{ color: "var(--ok)" }} data-testid="submit-success">{ok}</div>}
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              <button onClick={submit} disabled={busy || !loaded} data-testid="submit-button" className="btn">{busy ? "Sending…" : sub ? "Resubmit" : "Submit my work"}</button>
              {sub && <button onClick={cancel} disabled={busy} data-testid="submit-cancel-button" className="btn d">🗑️ Cancel submission</button>}
            </div>
            {sub && <div className="mu" style={{ fontSize: 12.5 }}>Want to change something? Edit the link or note, then press Resubmit. Or cancel to delete your submission.</div>}
          </div>
        </>
      )}
    </section>
  );
}
