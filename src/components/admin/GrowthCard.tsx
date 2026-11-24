"use client";

import { useMemo, useState } from "react";
import { CERTS } from "@/lib/certs";
import { activeDocs } from "@/lib/lessons";
import Icon from "./icons";
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
    <div className="gm" style={{ "--c": x.c } as React.CSSProperties} data-testid={`growth-tile-${x.k}`}>
      <div className="gmh">
        <span className="gti"><Icon name={x.icon} /></span>
        <span className="gtl">{x.l}</span>
        {diff > 0 ? <span className="gtd up">▲ +{diff}{x.unit ?? ""}</span> : diff < 0 ? <span className="gtd dn">▼ {diff}{x.unit ?? ""}</span> : <span className="gtd">– steady</span>}
      </div>
      <div className="gmv"><b data-testid={`growth-value-${x.k}`}>{x.f(last)}</b><span className="mu">{x.sub}</span></div>
      <div className="gsp" style={{ touchAction: "pan-y" }} onPointerMove={pos} onPointerDown={pos} onPointerLeave={() => setHover(null)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`gcg_${x.k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={x.c} stopOpacity=".3" />
              <stop offset="1" stopColor={x.c} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L100,100 L0,100Z`} fill={`url(#gcg_${x.k})`} />
          <path d={d} fill="none" stroke={x.c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <i className="gse" style={{ left: `${P[n - 1][0]}%`, top: `${P[n - 1][1]}%`, "--c": x.c } as React.CSSProperties} />
        {p && (
          <>
            <i className="gsx" style={{ display: "block", left: `${p[0]}%` }} />
            <i className="gsd" style={{ display: "block", left: `${p[0]}%`, top: `${p[1]}%`, background: x.c }} />
            <div className="gst" data-testid={`growth-tooltip-${x.k}`} style={{ display: "block", left: `${p[0]}%`, transform: p[0] > 60 ? "translateX(calc(-100% - 6px))" : "translateX(6px)" }}>
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
      { k: "trainees", l: "Trainees", c: "#6d5efc", v: cnt, icon: "users", sub: `${started} started learning`, f: (v) => String(v) },
      { k: "progress", l: "Average progress", c: "#14a37f", v: prog, icon: "trend", sub: "Lessons and certificates", f: (v) => v + "%", unit: " pts" },
      { k: "lessons", l: "Lessons completed", c: "#f59e0b", v: les, icon: "book", sub: `across ${A.length} lesson${s(A.length)}`, f: (v) => String(v) },
      { k: "certs", l: "Certificates", c: "#ec4899", v: cer, icon: "award", sub: `${holders} trainee${s(holders)} certified`, f: (v) => String(v) },
    ];
    return { labels: T.map((t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })), series };
  }, [trainees, docs, weeks]);

  return (
    <section className="card cc gcard" data-testid="growth-card">
      <div className="ch">
        <div>
          <h3>📈 Academy growth</h3>
          <div className="mu">Weekly snapshots · hover or tap a line</div>
        </div>
        <div className="gcr">
          {[8, 12, 26].map((n) => (
            <button key={n} type="button" onClick={() => setWeeks(n)} aria-pressed={weeks === n} data-testid={`growth-range-${n}`} className={`fch ${weeks === n ? "on" : ""}`}>{n}w</button>
          ))}
        </div>
      </div>
      <div className="gct">
        {series.map((x) => <Tile key={x.k + weeks} x={x} labels={labels} />)}
      </div>
      <div className="mu gcn">Each line has its own scale. History before dates were tracked starts flat.</div>
    </section>
  );
}
