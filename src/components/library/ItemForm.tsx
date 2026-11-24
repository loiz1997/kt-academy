"use client";

import { useEffect, useState } from "react";
import { VIDEO_CATS, type LibItem, type LibRecord } from "@/lib/library";

const field = "mt-1 mb-3 w-full border border-slate-300 bg-white px-3 py-2 text-slate-900";
const lbl = "text-sm font-semibold text-slate-700";

// Pop-up to add or edit a video link or a document link (admins only).
export default function ItemForm({ kind, item, onSave, onClose }: {
  kind: "video" | "doc"; item: LibItem | null; onSave: (rec: LibRecord) => Promise<string>; onClose: () => void;
}) {
  const v = kind === "video";
  const [title, setTitle] = useState(item?.title ?? "");
  const [descr, setDescr] = useState(item?.descr ?? "");
  const [cat, setCat] = useState(item?.cat ?? "General");
  const [link, setLink] = useState(item?.link ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  async function save() {
    setError("");
    if (!title.trim()) return setError("Please add a title.");
    if (!link.trim()) return setError("Please paste the link.");
    if (!/^https?:\/\//i.test(link.trim())) return setError("The link must start with https://");
    setBusy(true);
    const err = await onSave({ title: title.trim(), descr: descr.trim(), link: link.trim(), ...(v ? { cat } : {}) });
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" data-testid="library-form" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="mb-3 text-xl font-extrabold text-slate-900">{item ? (v ? "Edit video link" : "Edit document link") : v ? "Add video tutorial" : "Add KT document"}</h2>
        <label className={lbl} htmlFor="lib-title">Title</label>
        <input id="lib-title" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} data-testid="library-title-input" className={field} />
        <label className={lbl} htmlFor="lib-descr">Description</label>
        <textarea id="lib-descr" rows={2} maxLength={300} value={descr} onChange={(e) => setDescr(e.target.value)} data-testid="library-descr-input" className={field} />
        {v && (
          <>
            <label className={lbl} htmlFor="lib-cat">Category</label>
            <select id="lib-cat" value={cat} onChange={(e) => setCat(e.target.value)} data-testid="library-cat-select" className={field}>
              {VIDEO_CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </>
        )}
        <label className={lbl} htmlFor="lib-link">{v ? "Video link (YouTube, Vimeo, Google Drive…)" : "Document link (Google Drive, SharePoint, Confluence…)"}</label>
        <input id="lib-link" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} data-testid="library-link-input" className={field} />
        <p className="mb-2 text-sm text-slate-500">
          {v ? "Tip: if the video is private, set sharing so that trainees can open it." : "Tip: set sharing to “anyone with the link” (or your company) so trainees can open it."} Only the link is saved here, so it uses no storage.
        </p>
        {item?.path && <p className="mb-2 text-sm text-slate-500">This item is an old uploaded file ({item.fname || "file"}). Saving a link will replace it and free up the space.</p>}
        {error && <p className="mb-2 text-sm font-semibold text-red-600" data-testid="library-error">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} data-testid="library-cancel-button" className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
          <button type="button" onClick={save} disabled={busy} data-testid="library-save-button" className="bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60">
            {busy ? "Saving…" : item ? "Save changes" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
