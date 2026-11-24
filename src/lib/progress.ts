import { CERTS } from "./certs";
import { activeDocs, isSoon } from "./lessons";
import type { Doc, Learner, Profile } from "./types";

type Who = Pick<Profile, "done" | "certs">;

export const certsEarned = (u: Who) => CERTS.filter((c) => u.certs?.[c.k]?.earned).length;
export const lessonsDone = (u: Who, docs: Doc[]) => activeDocs(docs).filter((x) => (u.done ?? []).includes(x.id)).length;

// Overall progress: finished lessons + earned certificates, out of everything that can be completed.
export function overallProgress(u: Who, docs: Doc[]) {
  const total = activeDocs(docs).length + CERTS.length;
  if (!total) return 0;
  return Math.round(((lessonsDone(u, docs) + certsEarned(u)) / total) * 100);
}

export const scoreOf = (l: Learner) => Number(l.score) || 0;

export function topFive(learners: Learner[], docs: Doc[]) {
  return learners
    .map((u) => ({ u, p: overallProgress(u, docs), sc: scoreOf(u) }))
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc || b.p - a.p || String(a.u.name).localeCompare(String(b.u.name)))
    .slice(0, 5);
}

// The first lesson the trainee has not finished yet, for their track (Tools lessons are for everyone).
export function nextLesson(me: Profile, docs: Doc[]) {
  return docs
    .filter((x) => me.track === "Both" || x.c === me.track || x.c === "Tools")
    .find((x) => !me.done.includes(x.id) && !isSoon(x));
}
