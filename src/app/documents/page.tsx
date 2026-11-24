"use client";

import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ItemForm from "@/components/library/ItemForm";
import { fileIcon, fileUrl, fmtDate, fmtSize, hostOf, useLibrary, type LibItem } from "@/lib/library";
import { useAppData } from "@/lib/use-app-data";

const field = "border border-slate-300 bg-white px-3 py-2 text-slate-900";

export default function DocumentsPage() {
  const { data } = useAppData(false);
  const { items, error, save, remove } = useLibrary();
  const [q, setQ] = useState("");
  const [form, setForm] = useState<{ item: LibItem | null } | null>(null);
  const [msg, setMsg] = useState("");

  if (!data || !items) return <main className="p-8 text-slate-500">Loading…</main>;
  const admin = data.me.role === "admin";
  const all = items.filter((x) => x.kind === "doc");
  const ql = q.trim().toLowerCase();
  const list = all.filter((x) => `${x.title} ${x.descr} ${x.fname}`.toLowerCase().includes(ql));

  async function del(it: LibItem) {
    if (!confirm(`Delete "${it.title}"? This cannot be undone.`)) return;
    setMsg(await remove(it));
  }
  async function download(it: LibItem) {
    const u = await fileUrl(it, true);
    if (!u) return setMsg("Could not download: file not found.");
    const a = document.createElement("a");
    a.href = u;
    a.download = it.fname || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <>
      <AppHeader active="/learn" />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <Link href="/learn" data-testid="documents-back-link" className="inline-block border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">← Learning &amp; Tools</Link>
        <div className="mt-3 mb-1 flex flex-wrap items-center gap-3">
          <h1 className="min-w-[200px] flex-1 text-2xl font-extrabold text-slate-900" data-testid="documents-title">📎 KT documents</h1>
          {admin && <button type="button" onClick={() => setForm({ item: null })} data-testid="documents-add-button" className="bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md">➕ Add document link</button>}
        </div>
        <p className="mb-4 text-slate-500">Open the guides and files your KT lead shared.</p>
        {error && <p className="mb-3 text-sm font-semibold text-red-600" data-testid="documents-error">{error}</p>}
        {msg && <p className="mb-3 text-sm font-semibold text-red-600" data-testid="documents-action-error">{msg}</p>}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search documents…" aria-label="Search" data-testid="documents-search-input" className={`${field} mb-4 w-full max-w-xs`} />

        {list.length ? (
          <div className="grid gap-3">
            {list.map((x) => {
              const stored = !!x.path && !x.link;
              return (
                <div key={x.id} data-testid={`doc-row-${x.id}`} className="flex flex-wrap items-center gap-3 border border-slate-200 bg-white p-3 shadow-md">
                  <span className="text-2xl" aria-hidden="true">{stored ? fileIcon(x.fname) : "🔗"}</span>
                  <div className="min-w-0 flex-1 basis-56">
                    <b className="block text-slate-900">{x.title}</b>
                    {x.descr && <span className="block text-sm text-slate-500">{x.descr}</span>}
                    <span className="text-xs text-slate-500">{stored ? `${x.fname} · ${fmtSize(x.size)}` : hostOf(x.link)} · {fmtDate(x.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stored ? (
                      <button type="button" onClick={() => download(x)} data-testid={`doc-download-${x.id}`} className="bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white">⬇ Download</button>
                    ) : (
                      <a href={x.link} target="_blank" rel="noopener noreferrer" data-testid={`doc-open-${x.id}`} className="bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white">Open ↗</a>
                    )}
                    {admin && (
                      <>
                        <button type="button" onClick={() => setForm({ item: x })} data-testid={`doc-edit-${x.id}`} className="border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">✏️ Edit</button>
                        <button type="button" onClick={() => del(x)} data-testid={`doc-delete-${x.id}`} className="border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600">🗑 Delete</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-md" data-testid="documents-empty">
            {all.length ? "No documents match your search." : admin ? "No documents yet. Click “Add document link” to add the first one." : "No documents yet. Your KT lead will add them here."}
          </p>
        )}
      </main>
      {form && <ItemForm kind="doc" item={form.item} onClose={() => setForm(null)} onSave={async (rec) => { const err = await save("doc", form.item?.id ?? null, rec, form.item); if (!err) setForm(null); return err; }} />}
    </>
  );
}
