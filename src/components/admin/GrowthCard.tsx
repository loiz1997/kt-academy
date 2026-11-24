"use client";

import { useMemo, useState } from "react";
import { CERTS } from "@/lib/certs";
import { activeDocs } from "@/lib/lessons";
import type { Doc, Profile } from "@/lib/types";

type U = Profile & { created_at?: string };
type Series = { k: string; l: string; c: string; v: number[]; icon: string; sub: string; f: (v: number) => string; unit?: string };

const DAY = 864e5;
const ts = (x?: string | null) => {
  const t = x ? new Date(x).getTime() : NaN;
  return isNaN(t) ? -Infinity : t;
};

// Smooth line through the points that never overshoots (so it never dips below zero).
function smooth(P: number[][]) {
  const n = P.length;
  if (n < 2) return "";
  const dx: number[] = [], m: number[] = [], t: number[] = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = P[i + 1][0] - P[i][0]; m[i] = (P[i + 1][1] - P[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; }
    else {
      const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
    }
  }
  let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${(P[i][0] + h).toFixed(1)},${(P[i][1] + t[i] * h).toFixed(1)} ${(P[i + 1][0] - h).toFixed(1)},${(P[i + 1][1] - t[i + 1] * h).toFixed(1)} ${P[i + 1][0].toFixed(1)},${P[i + 1][1].toFixed(1)}`;
  }
  return d;
}

function Tile({ x, labels }: { x: Series; labels: string[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = x.v.length;
  const mx = Math.max(...x.v, 1);
  const P = x.v.map((v, i) => [(i * 100) / (n - 1 || 1), 94 - (80 * v) / mx]);
  const d = smooth(P);
  const last = x.v[n - 1];
  const diff = last - x.v[Math.max(0, n - 5)];
  const pos = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (n - 1)));
  };
  const p = hover != null ? P[hover] : null;
  return (
    <div className="border border-slate-200 bg-white p-3 shadow-sm" data-testid={`growth-tile-${x.k}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="grid h-7 w-7 place-items-center text-base" style={{ background: x.c + "22" }} aria-hidden="true">{x.icon}</span>
        <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{x.l}</span>
        <span className={`text-xs font-bold ${diff > 0 ? "text-green-700" : diff < 0 ? "text-red-600" : "text-slate-500"}`}>
          {diff > 0 ? `▲ +${diff}${x.unit ?? ""}` : diff < 0 ? `▼ ${diff}${x.unit ?? ""}` : "– steady"}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <b className="text-2xl text-slate-900" data-testid={`growth-value-${x.k}`}>{x.f(last)}</b>
        <span className="truncate text-xs text-slate-500">{x.sub}</span>
      </div>
      <div className="relative mt-2 h-20 touch-pan-y" onPointerMove={pos} onPointerDown={pos} onPointerLeave={() => setHover(null)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id={`gg_${x.k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={x.c} stopOpacity=".3" />
              <stop offset="1" stopColor={x.c} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L100,100 L0,100Z`} fill={`url(#gg_${x.k})`} />
          <path d={d} fill="none" stroke={x.c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {p && (
          <>
            <i className="pointer-events-none absolute top-0 bottom-0 w-px bg-slate-300" style={{ left: `${p[0]}%` }} />
            <i className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${p[0]}%`, top: `${p[1]}%`, background: x.c }} />
            <div
              data-testid={`growth-tooltip-${x.k}`}
              className="pointer-events-none absolute top-0 whitespace-nowrap border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-md"
              style={{ left: `${p[0]}%`, transform: p[0] > 60 ? "translateX(calc(-100% - 6px))" : "translateX(6px)" }}
            >
              {hover === n - 1 ? "Today" : labels[hover!]} · <b>{x.f(x.v[hover!])}</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// "Academy growth": four small weekly charts (trainees, progress, lessons, certificates).
export default function GrowthCard({ trainees, docs }: { trainees: U[]; docs: Doc[] }) {
  const [weeks, setWeeks] = useState(12);

  const { labels, series } = useMemo(() => {
    const A = activeDocs(docs);
    const den = A.length + CERTS.length || 1;
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const T = [...Array(weeks)].map((_, i) => end.getTime() - (weeks - 1 - i) * 7 * DAY);
    const cnt: number[] = [], prog: number[] = [], les: number[] = [], cer: number[] = [];
    for (const t of T) {
      const ex = trainees.filter((u) => ts(u.created_at) <= t);
      let l = 0, c = 0, ps = 0;
      for (const u of ex) {
        const ld = A.filter((d) => (u.done ?? []).includes(d.id) && ts(u.info?.doneAt?.[d.id]) <= t).length;
        const cc = CERTS.filter((k) => { const x = u.certs?.[k.k]; return x?.earned && ts(x.date) <= t; }).length;
        l += ld; c += cc; ps += ((ld + cc) / den) * 100;
      }
      cnt.push(ex.length); les.push(l); cer.push(c); prog.push(ex.length ? Math.round(ps / ex.length) : 0);
    }
    const started = trainees.filter((u) => u.done?.length).length;
    const holders = trainees.filter((u) => CERTS.some((k) => u.certs?.[k.k]?.earned)).length;
    const s = (n: number) => (n === 1 ? "" : "s");
    const series: Series[] = [
      { k: "trainees", l: "Trainees", c: "#6d5efc", v: cnt, icon: "👥", sub: `${started} started learning`, f: (v) => String(v) },
      { k: "progress", l: "Average progress", c: "#14a37f", v: prog, icon: "📈", sub: "Lessons and certificates", f: (v) => v + "%", unit: " pts" },
      { k: "lessons", l: "Lessons completed", c: "#f59e0b", v: les, icon: "📚", sub: `across ${A.length} lesson${s(A.length)}`, f: (v) => String(v) },
      { k: "certs", l: "Certificates", c: "#ec4899", v: cer, icon: "🏅", sub: `${holders} trainee${s(holders)} certified`, f: (v) => String(v) },
    ];
    return { labels: T.map((t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })), series };
  }, [trainees, docs, weeks]);

  return (
    <section className="border border-slate-200 bg-white p-5 shadow-md" data-testid="growth-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">📈 Academy growth</h2>
          <p className="text-sm text-slate-500">Weekly snapshots · hover or tap a line</p>
        </div>
        <div className="flex gap-1.5">
          {[8, 12, 26].map((n) => (
            <button key={n} type="button" onClick={() => setWeeks(n)} aria-pressed={weeks === n} data-testid={`growth-range-${n}`}
              className={`border px-2.5 py-1 text-sm font-semibold ${weeks === n ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-700"}`}>
              {n}w
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {series.map((x) => <Tile key={x.k + weeks} x={x} labels={labels} />)}
      </div>
    </section>
  );
}
