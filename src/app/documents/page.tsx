"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ItemForm from "@/components/library/ItemForm";
import { fileIcon, fileUrl, fmtDate, fmtSize, hostOf, useLibrary, type LibItem } from "@/lib/library";
import { useAppData } from "@/lib/use-app-data";


// Label + two colours for each kind of document.
function kind(x: LibItem, stored: boolean): [string, string, string] {
  const ext = (x.fname.split(".").pop() ?? "").toLowerCase();
  if (stored) {
    if (ext === "pdf") return ["PDF", "#e5484d", "#f97316"];
    if (["doc", "docx"].includes(ext)) return ["Word", "#2563eb", "#0ea5e9"];
    if (["xls", "xlsx", "csv"].includes(ext)) return ["Sheet", "#16a36a", "#14c8b4"];
    if (["ppt", "pptx"].includes(ext)) return ["Slides", "#f97316", "#f59e0b"];
    return ["File", "#64748b", "#94a3b8"];
  }
  const h = hostOf(x.link);
  if (h.startsWith("docs.google")) return ["Google Doc", "#2563eb", "#6d5efc"];
  if (h.startsWith("drive.google")) return ["Drive", "#16a36a", "#0ea5e9"];
  return ["Link", "#6d5efc", "#14c8b4"];
}

export default function DocumentsPage() {
  const { data } = useAppData(false);
  const { items, error, save, remove } = useLibrary();
  const [q, setQ] = useState("");
  const [form, setForm] = useState<{ item: LibItem | null } | null>(null);
  const [msg, setMsg] = useState("");

  if (!data || !items) return <PageLoading />;
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
      <main data-testid="documents-main-1">
        <Link href="/learn" data-testid="documents-back-link" className="btn g s">← Learning &amp; Tools</Link>
        <div className="row" style={{ margin: "14px 0 0" }}>
          <h1 className="grow text-2xl font-extrabold" style={{ margin: 0 }} data-testid="documents-title">📎 KT documents</h1>
          {admin && <button type="button" onClick={() => setForm({ item: null })} data-testid="documents-add-button" className="btn">➕ Add document link</button>}
        </div>
        <div className="dc-hero">
          <div className="big" aria-hidden="true">📚</div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 data-testid="documents-h2-1">Everything your KT lead shared</h2>
            <p>Guides, templates and files in one place. Open a link or download a file, and keep learning at your own pace.</p>
          </div>
          <div className="dc-pill" data-testid="documents-count"><b>{all.length}</b><span>{all.length === 1 ? "Document" : "Documents"}</span></div>
        </div>
        {error && <p className="msg" data-testid="documents-error">{error}</p>}
        {msg && <p className="msg" data-testid="documents-action-error">{msg}</p>}
        <div className="dc-bar">
          <input className="lin" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search documents…" aria-label="Search" data-testid="documents-search-input" />
          {ql && <span className="mu" style={{ fontSize: 13 }}>{list.length} found</span>}
        </div>

        {list.length ? (
          <div className="dc-grid">
            {list.map((x) => {
              const stored = !!x.path && !x.link;
              const [label, a, b] = kind(x, stored);
              return (
                <div key={x.id} data-testid={`doc-row-${x.id}`} className="dc-card" style={{ "--a": a, "--b": b } as React.CSSProperties}>
                  <div className="dc-top">
                    <div className="dc-ic" aria-hidden="true">{stored ? fileIcon(x.fname) : "🔗"}</div>
                    <span className="dc-ty">{label}</span>
                  </div>
                  <h3>{x.title}</h3>
                  {x.descr && <p>{x.descr}</p>}
                  <div className="dc-meta">
                    <span>{stored ? `${x.fname} · ${fmtSize(x.size)}` : hostOf(x.link)}</span>
                    <span>📅 {fmtDate(x.created_at)}</span>
                  </div>
                  <div className="dc-act">
                    {stored ? (
                      <button type="button" onClick={() => download(x)} data-testid={`doc-download-${x.id}`} className="btn s">⬇ Download</button>
                    ) : (
                      <a href={x.link} target="_blank" rel="noopener noreferrer" data-testid={`doc-open-${x.id}`} className="btn s">Open ↗</a>
                    )}
                    {admin && (
                      <>
                        <button type="button" onClick={() => setForm({ item: x })} data-testid={`doc-edit-${x.id}`} className="btn g s">✏️ Edit</button>
                        <button type="button" onClick={() => del(x)} data-testid={`doc-delete-${x.id}`} className="btn d s">🗑 Delete</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dc-empty" data-testid="documents-empty">
            <span className="e" aria-hidden="true">🗂️</span>
            <span>{all.length ? "No documents match your search." : admin ? "No documents yet. Click “Add document link” to add the first one." : "No documents yet. Your KT lead will add them here."}</span>
          </div>
        )}
      </main>
      {form && <ItemForm kind="doc" item={form.item} onClose={() => setForm(null)} onSave={async (rec) => { const err = await save("doc", form.item?.id ?? null, rec, form.item); if (!err) setForm(null); return err; }} />}
    </>
  );
}
