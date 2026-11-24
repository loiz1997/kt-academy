import { CERTS } from "@/lib/certs";
import { activeDocs } from "@/lib/lessons";
import { certsEarned, lessonsDone, overallProgress } from "@/lib/progress";
import type { Category, Doc, Profile } from "@/lib/types";

const card = "border border-slate-200 border-t-2 border-t-indigo-500 bg-white p-5 shadow-md";

function Donut({ parts, percent }: { parts: { v: number; c: string }[]; percent: number }) {
  const size = 150, r = 58, c = 2 * Math.PI * r;
  const total = parts.reduce((a, p) => a + p.v, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${percent}% complete`} className="shrink-0">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {parts.map((p, i) => {
          const len = (p.v / total) * c;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.c} strokeWidth={18} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </g>
      <text x="50%" y="48%" textAnchor="middle" dy=".35em" fontSize={26} fontWeight={800} fill="#1b2433">{percent}%</text>
      <text x="50%" y="64%" textAnchor="middle" fontSize={11} fill="#66728a">complete</text>
    </svg>
  );
}

export default function Overview({ me, docs }: { me: Profile; docs: Doc[] }) {
  const active = activeDocs(docs);
  const L = lessonsDone(me, docs);
  const C = certsEarned(me);
  const todo = active.length + CERTS.length - L - C;
  const cats = (["Local", "TestOps", "Tools"] as Category[])
    .map((c) => {
      const t = active.filter((d) => d.c === c);
      return { c, total: t.length, done: t.filter((d) => me.done.includes(d.id)).length };
    })
    .filter((x) => x.total);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className={card} data-testid="progress-overview">
        <h3 className="font-bold text-slate-900">Progress overview</h3>
        <p className="mb-4 text-sm text-slate-500">Everything you can complete right now</p>
        <div className="flex flex-wrap items-center gap-6">
          <Donut percent={overallProgress(me, docs)} parts={[{ v: L, c: "#6d5efc" }, { v: C, c: "#14c8b4" }, { v: todo, c: "#e3e8f1" }]} />
          <ul className="min-w-0 flex-1 basis-44 space-y-2 text-sm">
            {[
              ["#6d5efc", "Lessons done", `${L}/${active.length}`],
              ["#14c8b4", "Certifications earned", `${C}/${CERTS.length}`],
              ["#e3e8f1", "Still to do", String(todo)],
            ].map(([color, label, value]) => (
              <li key={label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-slate-700">
                  <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  {label}
                </span>
                <b>{value}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={card} data-testid="lessons-by-category">
        <h3 className="font-bold text-slate-900">Lessons by category</h3>
        <p className="mb-4 text-sm text-slate-500">How far you are in each area</p>
        <div className="space-y-3">
          {cats.map((x) => {
            const pct = Math.round((x.done / x.total) * 100);
            return (
              <div key={x.c} data-testid={`category-${x.c.toLowerCase()}`}>
                <div className="flex justify-between text-sm">
                  <span>
                    <b className="text-slate-900">{x.c}</b> <span className="text-slate-500">{x.done} of {x.total} lessons</span>
                  </span>
                  <b>{pct}%</b>
                </div>
                <div className="mt-1 h-2 bg-slate-100">
                  <div className="h-2 bg-indigo-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
