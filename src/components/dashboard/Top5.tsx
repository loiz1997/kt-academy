import Avatar from "./Avatar";
import { overallProgress, scoreOf, topFive } from "@/lib/progress";
import type { Doc, Learner } from "@/lib/types";

const RING = ["#f5b301", "#aab4c3", "#cd8a4b", "#6d5efc", "#14c8b4"];

export default function Top5({ learners, docs, meId, myScore }: { learners: Learner[]; docs: Doc[]; meId: string; myScore: number }) {
  const top = topFive(learners, docs);
  const inTop = top.some((x) => x.u.id === meId);
  const hint = inTop ? "You are in! Keep going 🎉" : `Get work approved to join${myScore ? ` (${myScore} pts)` : ""}`;

  return (
    <section className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-dashed border-slate-300 px-0.5 pb-5 pt-1" data-testid="top5-section">
      <div className="flex shrink-0 items-center gap-3">
        <span className="grid h-12 w-12 place-items-center bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-lg shadow-amber-300/70">🏆</span>
        <div>
          <b className="block text-xl font-extrabold text-slate-900">Top 5</b>
          <span className="text-sm text-slate-500">{hint}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 basis-[22rem] flex-wrap gap-2.5 pt-4 sm:flex-nowrap">
        {[0, 1, 2, 3, 4].map((i) => {
          const x = top[i];
          if (!x)
            return (
              <div key={i} data-testid="top5-empty-chip" className="flex min-w-0 flex-1 basis-[calc(50%-5px)] items-center gap-2.5 border border-dashed border-slate-300 p-2.5 opacity-70 sm:basis-0">
                <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-dashed border-slate-300 text-slate-400">?</span>
                <div className="text-sm leading-tight text-slate-500">
                  <b className="block text-slate-600">Open</b>spot
                </div>
              </div>
            );
          const mine = x.u.id === meId;
          return (
            <div
              key={x.u.id}
              data-testid={`top5-chip-${i + 1}`}
              title={`${x.u.name} · ${scoreOf(x.u)} pts · ${overallProgress(x.u, docs)}%`}
              className={`relative flex min-w-0 flex-1 basis-[calc(50%-5px)] items-center gap-2.5 border p-2.5 shadow-sm sm:basis-0 ${
                i === 0 ? "border-amber-300 bg-gradient-to-r from-amber-50 to-white" : "border-slate-200 bg-white"
              } ${i === 0 ? "basis-full sm:basis-0" : ""}`}
            >
              {i === 0 && <span className="absolute -top-3 left-3 text-xl">👑</span>}
              <span className="relative">
                <Avatar name={x.u.name} size={44} ring={RING[i]} />
                <span className="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white" style={{ background: RING[i] }}>
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0 text-sm leading-tight">
                <b className={`block truncate ${mine ? "text-indigo-600" : "text-slate-900"}`}>{mine ? "You" : x.u.name.split(" ")[0]}</b>
                <span className="whitespace-nowrap text-slate-500">{scoreOf(x.u)} pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
