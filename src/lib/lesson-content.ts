import data from "@/data/lessons.json";
import type { Doc } from "./types";

type Shot = { img?: string; cap?: string; img2?: string; cap2?: string };
export type Step = { t: string; d: string; tip?: string; warn?: string; note?: string; link?: [string, string] } & Shot;
export type Part = { t: string; s: string; steps: Step[] };
export type LessonContent = {
  sum: string;
  intro: string;
  meta?: string[];
  links: [string, string][];
  obj?: string[];
  need: string[];
  info?: ({ t: string; d: string; tip?: string } & Shot)[];
  scn?: { t: string; pre: string; steps: [string, string, string][]; note: string };
  parts: Part[];
  concepts?: [string, string][];
  help: [string, string][];
  check: string[];
  done?: string[];
  res?: [string, string][];
  next?: string;
  cert?: string;
};

const all = data as unknown as Record<string, LessonContent>;

// Same matching rule as the old site: exact title, or one title starts with the other.
export function getLesson(d: Doc): LessonContent | null {
  if (all[d.t]) return all[d.t];
  const k = Object.keys(all).find((k) => d.t.startsWith(k) || k.startsWith(d.t));
  return k ? all[k] : null;
}

export const imgSrc = (key: string) => `/lesson-images/${key}.jpg`;
