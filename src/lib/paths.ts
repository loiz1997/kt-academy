import data from "@/data/paths.json";

export type PathRow = [string, string, number]; // activity, target, lesson number inside the path (starts at 0)
export type PathOpt = { t?: string; n: number | string; rows: PathRow[] };
export type PathMod = { t: string; counts: string; goal: string; steps: string[]; tip?: string; warn?: string; note?: string; ref?: string };
export type PathData = { sum: string; intro: string; links: [string, string][]; acts: PathRow[]; opt?: PathOpt; opts?: PathOpt[]; mods: PathMod[] };

const all = data as unknown as Record<string, PathData>;
export const getPath = (k: string): PathData | undefined => all[k];
export const pOpts = (p: PathData): PathOpt[] => p.opts ?? (p.opt ? [p.opt] : []);
export const activityCount = (p: PathData) => p.acts.length + pOpts(p).reduce((n, x) => n + x.rows.length, 0);
