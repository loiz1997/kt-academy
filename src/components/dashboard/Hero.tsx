import Link from "next/link";
import Ring from "./Ring";
import { CERTS } from "@/lib/certs";
import { activeDocs } from "@/lib/lessons";
import { certsEarned, lessonsDone, nextLesson, overallProgress } from "@/lib/progress";
import type { Doc, Profile } from "@/lib/types";

function Chip({ icon, value, label, id, children }: { icon: string; value: string | number; label: string; id: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border border-slate-200 bg-white/80 p-3 shadow-sm" data-testid={id}>
      <span className="grid h-9 w-9 shrink-0 place-items-center bg-indigo-50 text-lg">{icon}</span>
      <div className="min-w-0">
        <b className="block truncate text-lg font-extrabold leading-tight text-slate-900">{value}</b>
        <span className="text-xs text-slate-500">
          {label}
          {children}
        </span>
      </div>
    </div>
  );
}

export default function Hero({ me, docs, score }: { me: Profile; docs: Doc[]; score: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = (me.name || me.email).split(" ")[0];
  const next = nextLesson(me, docs);

  return (
    <section
      className="relative overflow-hidden border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-5 shadow-lg shadow-indigo-200/40 sm:p-7"
      data-testid="dashboard-hero"
    >
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="min-w-0 flex-1 basis-72">
          <p className="text-sm text-slate-500">{greeting}</p>
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900" data-testid="dashboard-greeting">
            {first} 👋
          </h1>
          <p className="mb-4 max-w-xl text-slate-700" data-testid="dashboard-next-up">
            {next ? (
              <>
                Next up: <b>{next.t}</b>
              </>
            ) : (
              "You have finished every available lesson. More are coming soon!"
            )}
          </p>
          {next && (
            <Link
              href={`/lessons/${next.id}`}
              data-testid="dashboard-continue-button"
              className="inline-block bg-gradient-to-r from-indigo-600 to-teal-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-300/60"
            >
              ▶ Continue learning
            </Link>
          )}
        </div>
        <Ring percent={overallProgress(me, docs)} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Chip id="stat-lessons-done" icon="📘" value={`${lessonsDone(me, docs)}/${activeDocs(docs).length}`} label="Lessons done" />
        <Chip id="stat-certificates" icon="🏅" value={`${certsEarned(me)}/${CERTS.length}`} label="Certificates" />
        <Chip id="stat-score" icon="⭐" value={score} label="Score points" />
        <Chip id="stat-track" icon="🧭" value={me.track} label="Your track · ">
          <Link href="/profile" className="font-semibold text-indigo-600 underline" data-testid="stat-track-change-link">
            change
          </Link>
        </Chip>
      </div>
    </section>
  );
}
