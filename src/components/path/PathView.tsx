"use client";

import Link from "next/link";
import "@/styles/lesson.css";
import { findCert, type CERTS } from "@/lib/certs";
import { pOpts, type PathData, type PathRow } from "@/lib/paths";

const html = (s: string) => ({ __html: s });
const box = "border border-slate-200 bg-white p-5 shadow-md";
const ACADEMY = "https://academy.katalon.com/dashboard/certifications/";
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Table({ rows }: { rows: PathRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-3">Activity</th><th className="py-2 pr-3">Target</th><th className="py-2">How to</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a[0]} className="border-b border-slate-100">
              <td className="py-2 pr-3">{a[0]}</td>
              <td className="py-2 pr-3 font-bold">{a[1]}</td>
              <td className="py-2"><button onClick={() => go(`m${a[2]}`)} data-testid={`path-howto-lesson-${a[2] + 1}`} className="whitespace-nowrap font-semibold text-indigo-600 underline">Lesson {a[2] + 1} ›</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PathView({ cert, path, earned }: { cert: (typeof CERTS)[number]; path: PathData; earned: boolean }) {
  const opts = pOpts(path);
  const sections: [string, string][] = [["req", "✅ Requirements"], ...path.mods.map((m, i) => [`m${i}`, `${i + 1}. ${m.t}`] as [string, string]), ["fin", "🏁 Finish line"]];
  const items = [
    ...path.acts.map((a) => `${a[0]} (${a[1]})`),
    ...opts.map((x) => `Any ${x.n} of the ${x.rows.length} ${x.t ? x.t.replace(/^In /, "").replace(/, complete$/, "").toLowerCase() + " " : "extra "}activities`),
  ];

  return (
    <div onClick={(e) => {
      const b = (e.target as HTMLElement).closest("[data-copy]") as HTMLElement | null;
      const pre = b?.previousElementSibling as HTMLElement | null;
      if (b && pre) { navigator.clipboard?.writeText(pre.innerText); const old = b.textContent; b.textContent = "✓ Copied"; setTimeout(() => (b.textContent = old), 1500); }
    }}>
      <Link href="/paths" className="mb-3 inline-block bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700" data-testid="path-back-link">← Certification paths</Link>

      <section className="border border-indigo-100 p-5 shadow-lg sm:p-7" style={{ background: `radial-gradient(500px 260px at 0 0, ${cert.c}33, transparent 62%), linear-gradient(135deg, #eef0ff, #fff 55%, #e6f6f3)` }}>
        <span className="tag">🏅 Certification path · {cert.s}</span>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl" data-testid="path-title">{cert.t}</h1>
        <p className="mt-2 max-w-2xl text-slate-700" dangerouslySetInnerHTML={html(path.intro)} />
        <div className="mt-4 flex flex-wrap gap-2">
          {path.links.map(([label, href], i) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" data-testid={`path-link-${i + 1}`} className="border border-indigo-200 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700">{label}</a>
          ))}
        </div>
      </section>

      <select data-testid="path-jump-select" className="mt-4 block w-full border border-slate-300 bg-white p-2 lg:hidden" aria-label="Jump to section" defaultValue="" onChange={(e) => { go(e.target.value); e.target.value = ""; }}>
        <option value="">📑 Jump to…</option>
        {sections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>

      <div className="mt-4 grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="sticky top-20 hidden self-start border border-slate-200 bg-white p-3 text-sm shadow-md lg:flex lg:flex-col lg:gap-0.5">
          <b className="mb-1 text-xs tracking-wider text-slate-500">ON THIS PAGE</b>
          {sections.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} data-testid={`path-nav-${id}`} className="px-2 py-1 text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">{label}</button>
          ))}
        </aside>

        <div className="min-w-0 space-y-4">
          <section id="req" className={`${box} scroll-mt-20`} data-testid="path-requirements">
            <h2 className="text-lg font-bold">✅ What you need to do</h2>
            <p className="mb-2 text-sm text-slate-500">Do all of these activities in Katalon Studio. Each one links to the lesson that shows you how.</p>
            <Table rows={path.acts} />
            {opts.map((x, i) => (
              <div key={i}>
                <p className="mb-1 mt-4 font-bold">{x.t || "Then complete"} any {x.n} of these {x.rows.length} activities:</p>
                <Table rows={x.rows} />
              </div>
            ))}
            <div className="tipb nt">📝 Katalon can change the requirements over time, so compare with your Academy dashboard. Your progress there can take 1 to 2 days to update.</div>
          </section>

          {path.mods.map((m, i) => {
            const ref = m.ref ? findCert(m.ref) : null;
            return (
              <section key={m.t} id={`m${i}`} className={`${box} scroll-mt-20`} data-testid={`path-module-${i + 1}`}>
                <h2 className="text-lg font-bold">Lesson {i + 1}: <span dangerouslySetInnerHTML={html(m.t)} /></h2>
                <p className="text-sm text-slate-500" dangerouslySetInnerHTML={html(m.counts)} />
                <p className="mt-1.5" dangerouslySetInnerHTML={html(m.goal)} />
                {m.steps.map((s, j) => (
                  <div key={j} className="mt-4 flex gap-3.5 border-t border-slate-200 pt-4">
                    <span className="snum">{j + 1}</span>
                    <div className="min-w-0 flex-1 [overflow-wrap:anywhere]" dangerouslySetInnerHTML={html(s)} />
                  </div>
                ))}
                {m.tip && <div className="tipb" dangerouslySetInnerHTML={html(`💡 ${m.tip}`)} />}
                {m.warn && <div className="tipb warn" dangerouslySetInnerHTML={html(`⚠️ ${m.warn}`)} />}
                {m.note && <div className="tipb nt" dangerouslySetInnerHTML={html(`📝 ${m.note}`)} />}
                {ref && <p className="mt-3"><Link href={`/paths/${ref.k}`} data-testid={`path-open-${ref.k}`} className="inline-block bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">Open the {ref.t.replace(" Certification", "")} path ›</Link></p>}
              </section>
            );
          })}

          <section id="fin" className={`${box} scroll-mt-20`} data-testid="path-finish">
            <h2 className="text-lg font-bold">🏁 Finish line</h2>
            <p className="mb-2 text-sm text-slate-500">Tick each activity as you complete it.</p>
            {items.map((t, i) => <label key={t} className="flex items-center gap-2.5 py-1"><input type="checkbox" data-testid={`path-check-${i + 1}`} /> {t}</label>)}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={ACADEMY} target="_blank" rel="noopener noreferrer" data-testid="path-academy-link" className="bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2 font-semibold text-white shadow-lg shadow-indigo-300/50">🎓 Check my Academy progress ↗</a>
              <Link href={`/certifications/${cert.k}`} data-testid="path-save-cert-link" className="bg-indigo-50 px-4 py-2 font-semibold text-indigo-700">🏅 Save my certificate</Link>
            </div>
            {earned && <p className="mt-2.5 text-sm text-slate-500">✓ You have already saved this certificate.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
