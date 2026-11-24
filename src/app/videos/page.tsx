"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ItemForm from "@/components/library/ItemForm";
import VideoModal from "@/components/library/VideoModal";
import { VIDEO_CATS, fmtDate, useLibrary, type LibItem } from "@/lib/library";
import { useAppData } from "@/lib/use-app-data";


export default function VideosPage() {
  const { data } = useAppData(false);
  const { items, error, save, remove } = useLibrary();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [play, setPlay] = useState<LibItem | null>(null);
  const [form, setForm] = useState<{ item: LibItem | null } | null>(null);
  const [msg, setMsg] = useState("");

  if (!data || !items) return <PageLoading />;
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
        <Link href="/learn" data-testid="videos-back-link" className="btn g s">← Learning &amp; Tools</Link>
        <div className="row" style={{ margin: "14px 0 4px" }}>
          <h1 className="grow text-2xl font-extrabold" style={{ margin: 0 }} data-testid="videos-title">🎬 Video tutorials</h1>
          {admin && <button type="button" onClick={() => setForm({ item: null })} data-testid="videos-add-button" className="btn">➕ Add video link</button>}
        </div>
        <p className="mu" style={{ marginBottom: 16 }}>Short walkthroughs you can watch at your own pace.</p>
        {error && <p className="msg" data-testid="videos-error">{error}</p>}
        {msg && <p className="msg" data-testid="videos-action-error">{msg}</p>}

        <div className="row" style={{ marginBottom: 16 }}>
          <input className="lin" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search videos…" aria-label="Search" data-testid="videos-search-input" />
          <div className="tabs">
            {["All", ...VIDEO_CATS].map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} data-testid={`videos-cat-${c}`} className={`chip ${cat === c ? "on" : ""}`}>{c}</button>
            ))}
          </div>
        </div>

        {list.length ? (
          <div className="vgrid">
            {list.map((x) => (
              <div key={x.id} data-testid={`video-card-${x.id}`} className="card vcard">
                <button type="button" onClick={() => setPlay(x)} data-testid={`video-play-${x.id}`} aria-label={`Play ${x.title}`} className="vthumb">
                  <span className="vplay">▶</span>
                  <span className="tag" style={{ position: "absolute", left: 10, top: 10, background: "rgba(255,255,255,.2)", color: "#fff" }}>{x.cat}</span>
                </button>
                <h2>{x.title}</h2>
                <p className="mu">{x.descr ?? ""}</p>
                <div className="row" style={{ marginTop: "auto", paddingTop: 8 }}>
                  <span className="grow mu" style={{ fontSize: 12 }}>{x.path ? "⬆ Uploaded" : "🔗 Link"} · {fmtDate(x.created_at)}</span>
                  {admin ? (
                    <>
                      <button type="button" onClick={() => setForm({ item: x })} data-testid={`video-edit-${x.id}`} className="btn g s">✏️ Edit</button>
                      <button type="button" onClick={() => del(x)} data-testid={`video-delete-${x.id}`} aria-label="Delete" className="btn d s">🗑</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setPlay(x)} data-testid={`video-watch-${x.id}`} className="btn s">Watch ›</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mu" data-testid="videos-empty">
            {all.length ? "No videos match your search." : admin ? "No videos yet. Click “Add video link” to add the first one." : "No videos yet. Your KT lead will add video tutorials here."}
          </p>
        )}
      </main>
      {play && <VideoModal item={play} onClose={() => setPlay(null)} />}
      {form && <ItemForm kind="video" item={form.item} onClose={() => setForm(null)} onSave={async (rec) => { const err = await save("video", form.item?.id ?? null, rec, form.item); if (!err) setForm(null); return err; }} />}
    </>
  );
}
