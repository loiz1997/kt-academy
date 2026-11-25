import { CERTS } from "@/lib/certs";
import { activeDocs } from "@/lib/lessons";
import { certsEarned, lessonsDone, overallProgress } from "@/lib/progress";
import type { Category, Doc, Profile } from "@/lib/types";

const CATC: Record<Category, string> = { Local: "#6d5efc", TestOps: "#14c8b4", Tools: "#f59e0b" };

export function Donut({ parts, mid, sub, z = 150 }: { parts: { v: number; c: string }[]; mid: string; sub: string; z?: number }) {
  const r = z / 2 - 13, c = 2 * Math.PI * r;
  const tot = parts.reduce((s, x) => s + x.v, 0);
  let off = 0;
  return (
    <svg data-testid="dashboard-donut-chart" className="dn" width={z} height={z} viewBox={`0 0 ${z} ${z}`} role="img" aria-label={`${mid} ${sub}`}>
      <circle cx={z / 2} cy={z / 2} r={r} fill="none" stroke="var(--br)" strokeWidth={14} />
      {tot > 0 && parts.filter((x) => x.v > 0).map((x, i) => {
        const len = (x.v / tot) * c;
        const el = <circle key={i} cx={z / 2} cy={z / 2} r={r} fill="none" stroke={x.c} strokeWidth={14} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform={`rotate(-90 ${z / 2} ${z / 2})`} />;
        off += len;
        return el;
      })}
      <text x="50%" y="46%" textAnchor="middle" dy=".35em" style={{ fill: "var(--tx)", font: `800 ${Math.round(z / 5.2)}px var(--font-sora), sans-serif` }}>{mid}</text>
      <text x="50%" y="64%" textAnchor="middle" style={{ fill: "var(--mu)", font: "600 11px var(--font-inter), sans-serif" }}>{sub}</text>
    </svg>
  );
}

export default function Overview({ me, docs }: { me: Profile; docs: Doc[] }) {
  const A = activeDocs(docs);
  const L = lessonsDone(me, docs);
  const C = certsEarned(me);
  const tot = A.length + CERTS.length;
  const p = overallProgress(me, docs);
  const cats = (["Local", "TestOps", "Tools"] as Category[])
    .map((c) => { const t = A.filter((d) => d.c === c); return { c, t: t.length, dn: t.filter((d) => me.done.includes(d.id)).length }; })
    .filter((x) => x.t);

  return (
    <div className="cgw">
      <div className="cg c2">
        <section className="card cc" data-testid="progress-overview">
          <div className="ch"><div><h3>Progress overview</h3><div className="mu">Everything you can complete right now</div></div></div>
          <div className="dnw">
            <Donut parts={[{ v: L, c: "#6d5efc" }, { v: C, c: "#14c8b4" }]} z={150} mid={`${p}%`} sub="complete" />
            <div className="lgd">
              <div><i style={{ background: "#6d5efc" }} />Lessons done<b>{L}/{A.length}</b></div>
              <div><i style={{ background: "#14c8b4" }} />Certifications earned<b>{C}/{CERTS.length}</b></div>
              <div><i style={{ background: "var(--br)" }} />Still to do<b>{Math.max(0, tot - L - C)}</b></div>
            </div>
          </div>
        </section>
        <section className="card cc" data-testid="lessons-by-category">
          <div className="ch"><div><h3>Lessons by category</h3><div className="mu">How far you are in each area</div></div></div>
          {cats.map((x) => {
            const q = Math.round((x.dn / x.t) * 100);
            return (
              <div className="hb" key={x.c} data-testid={`category-${x.c.toLowerCase()}`}>
                <div className="hl" title={x.c}>{x.c}<small>{x.dn} of {x.t} lesson{x.t === 1 ? "" : "s"}</small></div>
                <div className="ht"><i style={{ width: `${Math.max(0, Math.min(100, q))}%`, background: CATC[x.c] }} /></div>
                <div className="hv">{q}%</div>
              </div>
            );
          })}
          {!cats.length && <p className="mu">Lessons will appear here soon.</p>}
        </section>
      </div>
    </div>
  );
}
