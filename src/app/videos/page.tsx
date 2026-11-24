"use client";

import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ItemForm from "@/components/library/ItemForm";
import VideoModal from "@/components/library/VideoModal";
import { VIDEO_CATS, fmtDate, useLibrary, type LibItem } from "@/lib/library";
import { useAppData } from "@/lib/use-app-data";

const field = "border border-slate-300 bg-white px-3 py-2 text-slate-900";

export default function VideosPage() {
  const { data } = useAppData(false);
  const { items, error, save, remove } = useLibrary();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [play, setPlay] = useState<LibItem | null>(null);
  const [form, setForm] = useState<{ item: LibItem | null } | null>(null);
  const [msg, setMsg] = useState("");

  if (!data || !items) return <main className="p-8 text-slate-500">Loading…</main>;
  const admin = data.me.role === "admin";
  const all = items.filter((x) => x.kind === "video");
  const ql = q.trim().toLowerCase();
  const list = all.filter((x) => (cat === "All" || x.cat === cat) && `${x.title} ${x.descr}`.toLowerCase().includes(ql));

  async function del(it: LibItem) {
    if (!confirm(`Delete "${it.title}"? This cannot be undone.`)) return;
    setMsg(await remove(it));
  }

  return (
    <>
      <AppHeader active="/learn" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <Link href="/learn" data-testid="videos-back-link" className="inline-block border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">← Learning &amp; Tools</Link>
        <div className="mt-3 mb-1 flex flex-wrap items-center gap-3">
          <h1 className="min-w-[200px] flex-1 text-2xl font-extrabold text-slate-900" data-testid="videos-title">🎬 Video tutorials</h1>
          {admin && <button type="button" onClick={() => setForm({ item: null })} data-testid="videos-add-button" className="bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md">➕ Add video link</button>}
        </div>
        <p className="mb-4 text-slate-500">Short walkthroughs you can watch at your own pace.</p>
        {error && <p className="mb-3 text-sm font-semibold text-red-600" data-testid="videos-error">{error}</p>}
        {msg && <p className="mb-3 text-sm font-semibold text-red-600" data-testid="videos-action-error">{msg}</p>}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search videos…" aria-label="Search" data-testid="videos-search-input" className={`${field} min-w-[200px] max-w-xs flex-1`} />
          {["All", ...VIDEO_CATS].map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} data-testid={`videos-cat-${c}`} className={`border px-3 py-1.5 text-sm font-semibold ${cat === c ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-700"}`}>{c}</button>
          ))}
        </div>

        {list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((x) => (
              <div key={x.id} data-testid={`video-card-${x.id}`} className="flex flex-col border border-slate-200 bg-white p-3 shadow-md">
                <button type="button" onClick={() => setPlay(x)} data-testid={`video-play-${x.id}`} aria-label={`Play ${x.title}`} className="relative grid h-32 place-items-center bg-gradient-to-br from-indigo-600 to-teal-500 text-4xl text-white">
                  ▶
                  <span className="absolute top-2 left-2 bg-white/25 px-2 py-0.5 text-xs font-semibold">{x.cat}</span>
                </button>
                <h2 className="mt-2.5 font-bold text-slate-900">{x.title}</h2>
                {x.descr && <p className="text-sm text-slate-500">{x.descr}</p>}
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <span className="flex-1 text-xs text-slate-500">{x.path ? "⬆ Uploaded" : "🔗 Link"} · {fmtDate(x.created_at)}</span>
                  {admin ? (
                    <>
                      <button type="button" onClick={() => setForm({ item: x })} data-testid={`video-edit-${x.id}`} className="border border-slate-300 px-2.5 py-1 text-sm font-semibold text-slate-700">✏️ Edit</button>
                      <button type="button" onClick={() => del(x)} data-testid={`video-delete-${x.id}`} aria-label="Delete" className="border border-red-200 px-2.5 py-1 text-sm text-red-600">🗑</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setPlay(x)} className="bg-indigo-600 px-3 py-1 text-sm font-bold text-white">Watch ›</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-md" data-testid="videos-empty">
            {all.length ? "No videos match your search." : admin ? "No videos yet. Click “Add video link” to add the first one." : "No videos yet. Your KT lead will add video tutorials here."}
          </p>
        )}
      </main>
      {play && <VideoModal item={play} onClose={() => setPlay(null)} />}
      {form && <ItemForm kind="video" item={form.item} onClose={() => setForm(null)} onSave={async (rec) => { const err = await save("video", form.item?.id ?? null, rec, form.item); if (!err) setForm(null); return err; }} />}
    </>
  );
}
