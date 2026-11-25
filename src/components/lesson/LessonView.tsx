"use client";

import Link from "next/link";
import { useState } from "react";
import { getLesson, imgSrc, type LessonContent } from "@/lib/lesson-content";
import "@/styles/lesson.css";
import SubmitCard from "./SubmitCard";
import { isSoon } from "@/lib/lessons";
import type { Doc, Profile } from "@/lib/types";

const html = (s: string) => ({ __html: s });
const box = "border border-slate-200 bg-white p-5 shadow-md";

type Shot = { key: string; cap: string };

function Shots({ shots, onOpen }: { shots: (Shot | null)[]; onOpen: (s: Shot) => void }) {
  const list = shots.filter(Boolean) as Shot[];
  if (!list.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {list.map((s, i) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onOpen(s)}
          data-testid={`lesson-screenshot-button-${s.key}`}
          className="border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white"
        >
          🖼 {list.length > 1 ? `Screenshot ${i + 1}` : "View screenshot"}
        </button>
      ))}
    </div>
  );
}

const sh = (k?: string, c?: string): Shot | null => (k ? { key: k, cap: c ?? "" } : null);

export default function LessonView({
  doc, docs, me, onToggle,
}: { doc: Doc; docs: Doc[]; me: Profile; onToggle: (id: number) => Promise<boolean> }) {
  const L = getLesson(doc) as LessonContent | null;
  const [shot, setShot] = useState<Shot | null>(null);
  const [busy, setBusy] = useState(false);
  const done = me.done.includes(doc.id);
  const next = docs.slice(docs.indexOf(doc) + 1).find((x) => !isSoon(x));

  async function toggle() {
    setBusy(true);
    await onToggle(doc.id);
    setBusy(false);
  }

  // Makes the "Copy code" buttons inside the lesson text work.
  function onContentClick(e: React.MouseEvent) {
    const b = (e.target as HTMLElement).closest("[data-copy]") as HTMLElement | null;
    const pre = b?.previousElementSibling as HTMLElement | null;
    if (!b || !pre) return;
    navigator.clipboard?.writeText(pre.innerText);
    const old = b.textContent;
    b.textContent = "✓ Copied";
    setTimeout(() => (b.textContent = old), 1500);
  }

  const submit = me.role === "user" ? <SubmitCard doc={doc} docs={docs} me={me} /> : null;

  const footer = (
    <section className={`${box} mt-4 flex flex-wrap items-center gap-3`} data-testid="lesson-footer">
      <div className="min-w-0 flex-1 basis-56">
        <b data-testid="lesson-status">{done ? "✓ You completed this lesson" : "Finished this lesson?"}</b>
        <div className="text-sm text-slate-500">{done ? "Nice work!" : "Mark it complete to update your progress."}</div>
      </div>
      {me.role === "user" && (
        <button
          onClick={toggle}
          disabled={busy}
          data-testid="lesson-done-button"
          className={`px-4 py-2 font-semibold disabled:opacity-60 ${done ? "bg-indigo-50 text-indigo-700" : "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-300/50"}`}
        >
          {done ? "Undo" : "Mark as complete"}
        </button>
      )}
      {next && (
        <Link href={`/lessons/${next.id}`} data-testid="lesson-next-button" className="bg-indigo-50 px-4 py-2 font-semibold text-indigo-700">
          Next lesson ›
        </Link>
      )}
    </section>
  );

  const back = (
    <Link href="/learn" className="mb-3 inline-block bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700" data-testid="lesson-back-link">
      ← KT lessons
    </Link>
  );

  if (!L)
    return (
      <>
        {back}
        <section data-testid="lesson-lessonview-section-1" className="border border-indigo-100 bg-gradient-to-br from-indigo-50 to-teal-50 p-6">
          <span className="tag">{doc.c} · {doc.l}</span>
          <h1 className="mt-2 text-2xl font-extrabold" data-testid="lesson-title">{doc.t}</h1>
        </section>
        <section data-testid="lesson-lessonview-section-2" className={`${box} mt-4`}>{doc.b || "No details have been added yet."}</section>
        {submit}
        {footer}
      </>
    );

  const total = L.parts.reduce((a, p) => a + p.steps.length, 0);
  const starts = L.parts.map((_, i) => L.parts.slice(0, i).reduce((a, p) => a + p.steps.length, 0)); // step numbers keep counting across parts
  const sections: [string, string][] = [];
  if (L.obj) sections.push(["lo", "🎯 What you will learn"]);
  if (L.info) sections.push(["ln", "🧠 The big idea"]);
  if (L.scn) sections.push(["ls", "🧪 Practice scenario"]);
  L.parts.forEach((p, i) => sections.push([`p${i}`, `${i + 1}. ${p.t}`]));
  if (L.concepts) sections.push(["cc", "📖 Key words"]);
  sections.push(["lh", "🛟 Need help?"], ["lc", "✅ Checklist"]);
  if (L.done) sections.push(["ld", "🏁 You are done when"]);
  if (L.res) sections.push(["lr", "🔗 Resources"]);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div onClick={onContentClick}>
      {back}
      <section data-testid="lesson-lessonview-section-3" className="border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-5 shadow-lg shadow-indigo-200/40 sm:p-7">
        <span className="tag">{doc.c} · {doc.l} · {total} steps</span>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl" data-testid="lesson-title">{doc.t}</h1>
        <p className="mt-2 max-w-2xl text-slate-700" dangerouslySetInnerHTML={html(L.intro)} />
        {L.meta && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {L.meta.map((m) => <span key={m} className="border border-slate-200 bg-white px-2.5 py-1">{m}</span>)}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {L.links.map(([label, href], i) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" data-testid={`lesson-link-${i + 1}`} className="border border-indigo-200 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700">{label}</a>
          ))}
        </div>
      </section>

      <select data-testid="lesson-jump-select" className="mt-4 block w-full border border-slate-300 bg-white p-2 lg:hidden" aria-label="Jump to section" defaultValue="" onChange={(e) => { go(e.target.value); e.target.value = ""; }}>
        <option value="">📑 Jump to…</option>
        {sections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>

      <div className="mt-4 grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside data-testid="lesson-lessonview-aside-1" className="sticky top-20 hidden self-start border border-slate-200 bg-white p-3 text-sm shadow-md lg:flex lg:flex-col lg:gap-0.5">
          <b className="mb-1 text-xs tracking-wider text-slate-500">ON THIS PAGE</b>
          {sections.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} data-testid={`lesson-nav-${id}`} className="px-2 py-1 text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">{label}</button>
          ))}
        </aside>

        <div className="min-w-0 space-y-4">
          {L.obj && (
            <section data-testid="lesson-lessonview-section-4" id="lo" className={`${box} scroll-mt-20`}>
              <h2 data-testid="lesson-lessonview-h2-1" className="mb-2 text-lg font-bold">🎯 What you will learn</h2>
              {L.obj.map((x) => <div key={x} className="py-1" dangerouslySetInnerHTML={html(`✔ ${x}`)} />)}
            </section>
          )}

          <section data-testid="lesson-lessonview-section-5" className={box}>
            <h2 data-testid="lesson-lessonview-h2-2" className="mb-2 text-lg font-bold">What you need</h2>
            {L.need.map((x) => <div key={x} className="py-1" dangerouslySetInnerHTML={html(`• ${x}`)} />)}
          </section>

          {L.info && (
            <section data-testid="lesson-lessonview-section-6" id="ln" className={`${box} scroll-mt-20`}>
              <h2 data-testid="lesson-lessonview-h2-3" className="mb-2 text-lg font-bold">🧠 The big idea</h2>
              {L.info.map((x) => (
                <div key={x.t} className="mt-3 border-t border-slate-200 pt-2">
                  <h3 className="mb-1 font-bold">{x.t}</h3>
                  <div dangerouslySetInnerHTML={html(x.d)} />
                  <Shots shots={[sh(x.img, x.cap)]} onOpen={setShot} />
                  {x.tip && <div className="tipb mt-3" dangerouslySetInnerHTML={html(`💡 ${x.tip}`)} />}
                </div>
              ))}
            </section>
          )}

          {L.scn && (
            <section data-testid="lesson-lessonview-section-7" id="ls" className={`${box} scroll-mt-20`}>
              <h2 data-testid="lesson-lessonview-h2-4" className="mb-2 text-lg font-bold">🧪 Practice scenario</h2>
              <p className="text-sm text-slate-500"><b dangerouslySetInnerHTML={html(L.scn.t)} /><br />Before you start: <span dangerouslySetInnerHTML={html(L.scn.pre)} /></p>
              {L.scn.steps.map((x, i) => (
                <div key={i} className="mt-3 flex gap-3 border border-slate-200 bg-slate-50 p-3">
                  <span className="snum">{i + 1}</span>
                  <div className="min-w-0 [overflow-wrap:anywhere]">
                    <b dangerouslySetInnerHTML={html(x[0])} />
                    {x[1] && <div className="text-sm text-slate-500" dangerouslySetInnerHTML={html(x[1])} />}
                    <div className="mt-1 text-sm font-semibold text-emerald-700" dangerouslySetInnerHTML={html(`✓ Expected: ${x[2]}`)} />
                  </div>
                </div>
              ))}
              <div className="tipb nt mt-3" dangerouslySetInnerHTML={html(`📝 ${L.scn.note}`)} />
            </section>
          )}

          {L.parts.map((p, i) => (
            <section key={p.t} id={`p${i}`} className={`${box} scroll-mt-20`} data-testid={`lesson-part-${i + 1}`}>
              <h2 data-testid={`lesson-part-title-${i + 1}`} className="text-lg font-bold">Part {i + 1}: <span dangerouslySetInnerHTML={html(p.t)} /></h2>
              <p className="text-sm text-slate-500" dangerouslySetInnerHTML={html(p.s)} />
              {p.steps.map((s, j) => {
                const n = starts[i] + j + 1;
                return (
                  <div key={n} className="mt-4 flex gap-3.5 border-t border-slate-200 pt-4">
                    <span className="snum">{n}</span>
                    <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                      <h3 className="mb-1 font-bold" dangerouslySetInnerHTML={html(s.t)} />
                      <div dangerouslySetInnerHTML={html(s.d)} />
                      {s.tip && <div className="tipb" dangerouslySetInnerHTML={html(`💡 ${s.tip}`)} />}
                      {s.warn && <div className="tipb warn" dangerouslySetInnerHTML={html(`⚠️ ${s.warn}`)} />}
                      {s.note && <div className="tipb nt" dangerouslySetInnerHTML={html(`📝 ${s.note}`)} />}
                      {s.link && <p className="mt-3"><a href={s.link[1]} target="_blank" rel="noopener noreferrer" data-testid={`lesson-step-link-${n}`} className="inline-block border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">{s.link[0]}</a></p>}
                      <Shots shots={[sh(s.img, s.cap), sh(s.img2, s.cap2)]} onOpen={setShot} />
                    </div>
                  </div>
                );
              })}
            </section>
          ))}

          {L.concepts && (
            <section data-testid="lesson-lessonview-section-8" id="cc" className={`${box} scroll-mt-20`}>
              <h2 data-testid="lesson-lessonview-h2-5" className="mb-2 text-lg font-bold">📖 Key words</h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {L.concepts.map((c) => (
                  <div key={c[0]} className="border border-slate-200 p-3 text-sm"><b className="block" dangerouslySetInnerHTML={html(c[0])} /><span dangerouslySetInnerHTML={html(c[1])} /></div>
                ))}
              </div>
            </section>
          )}

          <section data-testid="lesson-lessonview-section-9" id="lh" className={`${box} scroll-mt-20`}>
            <h2 data-testid="lesson-lessonview-h2-6" className="mb-2 text-lg font-bold">🛟 Need help?</h2>
            {L.help.map((h) => (
              <details key={h[0]} className="py-1"><summary className="cursor-pointer font-semibold" dangerouslySetInnerHTML={html(h[0])} /><p className="mt-1.5 text-slate-600" dangerouslySetInnerHTML={html(h[1])} /></details>
            ))}
          </section>

          <section data-testid="lesson-lessonview-section-10" id="lc" className={`${box} scroll-mt-20`}>
            <h2 data-testid="lesson-lessonview-h2-7" className="mb-2 text-lg font-bold">✅ Lesson checklist</h2>
            {L.check.map((c, i) => (
              <label key={c} data-testid={`lesson-check-label-${i + 1}`} className="flex items-center gap-2.5 py-1"><input type="checkbox" data-testid={`lesson-check-${i + 1}`} /> <span dangerouslySetInnerHTML={html(c)} /></label>
            ))}
          </section>

          {L.done && (
            <section data-testid="lesson-lessonview-section-11" id="ld" className={`${box} scroll-mt-20`}>
              <h2 data-testid="lesson-lessonview-h2-8" className="mb-2 text-lg font-bold">🏁 You are done when…</h2>
              {L.done.map((x) => <div key={x} className="py-1" dangerouslySetInnerHTML={html(`✅ ${x}`)} />)}
            </section>
          )}

          {L.res && (
            <section data-testid="lesson-lessonview-section-12" id="lr" className={`${box} scroll-mt-20`}>
              <h2 data-testid="lesson-lessonview-h2-9" className="mb-2 text-lg font-bold">🔗 Resources</h2>
              {L.res.map((r, i) => <div key={r[1]} className="py-1"><a href={r[1]} target="_blank" rel="noopener noreferrer" data-testid={`lesson-resource-${i + 1}`} className="font-semibold text-indigo-600 underline">{r[0]} ↗</a></div>)}
              {L.next && <div className="tipb nt mt-3" dangerouslySetInnerHTML={html(`📝 ${L.next}`)} />}
            </section>
          )}

          {submit}
        {footer}
        </div>
      </div>

      {shot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onClick={() => setShot(null)} role="dialog" aria-modal="true" data-testid="image-viewer">
          <div className="max-h-[92vh] w-[min(96vw,1000px)] overflow-auto bg-white p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold">
              <span>{shot.cap || "Screenshot"}</span>
              <button onClick={() => setShot(null)} data-testid="image-viewer-close" className="bg-indigo-50 px-3 py-1.5 text-indigo-700">✕ Close</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-testid="lesson-lessonview-img-1" src={imgSrc(shot.key)} alt={shot.cap} className="block w-full border border-slate-200" />
          </div>
        </div>
      )}
    </div>
  );
}
