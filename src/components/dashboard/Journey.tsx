"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { activeDocs, isSoon } from "@/lib/lessons";
import { soonToast } from "@/lib/overlay";
import type { Doc, Profile } from "@/lib/types";

const colorOf = (c: string) => (c === "TestOps" ? "#6d5efc" : c === "Tools" ? "#f59e0b" : "#14a37f");
const iconOf = (c: string) => (c === "TestOps" ? "☁️" : c === "Tools" ? "🧰" : "💻");
const noLine: CSSProperties = { textDecoration: "none" };

// "Up next" card and the "Your journey" lesson squares.
export default function Journey({ me, docs }: { me: Profile; docs: Doc[] }) {
  const mine = docs.filter((d) => me.track === "Both" || d.c === me.track || d.c === "Tools");
  const next = mine.filter((d) => !me.done.includes(d.id) && !isSoon(d));
  const nx = next[0];
  const A = activeDocs(docs);
  const doneN = A.filter((d) => me.done.includes(d.id)).length;

  return (
    <div className="dcols dc1">
      <div>
        <div className="card upn" data-testid="up-next">
          <div className="row">
            <h2 data-testid="dashboard-journey-h2-1" className="grow" style={{ margin: 0 }}>🚀 Up next</h2>
            <span className="mu" data-testid="up-next-count">{next.length} lesson{next.length === 1 ? "" : "s"} to go</span>
          </div>
          {nx ? (
            <div className="uph" style={{ "--c": colorOf(nx.c) } as CSSProperties}>
              <div className="uic" aria-hidden="true">{iconOf(nx.c)}</div>
              <div className="grow">
                <div className="ut" data-testid="up-next-title">{nx.t}</div>
                <div className="ucm"><span>{nx.c}</span><span>{nx.l}</span></div>
                {nx.b && <div className="ubr">{nx.b}</div>}
              </div>
              <Link href={`/lessons/${nx.id}`} className="ugo" style={noLine} data-testid="up-next-start-button">Start lesson <i>→</i></Link>
            </div>
          ) : (
            <div className="ucel" data-testid="up-next-done"><b>🎉 You are all caught up!</b>More lessons are coming soon.</div>
          )}
          {next.length > 1 && (
            <div className="ulst">
              {next.slice(1, 3).map((d, i) => (
                <Link key={d.id} href={`/lessons/${d.id}`} className="uni" style={{ "--c": colorOf(d.c), textDecoration: "none" } as CSSProperties} data-testid={`up-next-item-${i + 2}`}>
                  <span className="un">{i + 2}</span>
                  <div className="grow" style={{ minWidth: 0 }}><b>{d.t}</b><span className="mu">{d.c} · {d.l}</span></div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card jr" style={{ marginTop: 16 }} data-testid="journey">
          <div className="row">
            <h2 data-testid="dashboard-journey-h2-2" className="grow" style={{ margin: 0 }}>🗺 Your journey</h2>
            <span className="jct" data-testid="journey-count"><b>{doneN}</b> / {A.length} lessons</span>
          </div>
          <div className="jbar"><i style={{ width: `${A.length ? Math.round((doneN / A.length) * 100) : 0}%` }} /></div>
          <div className="jgrid">
            {docs.map((d, i) => {
              const ok = me.done.includes(d.id), cur = nx && nx.id === d.id, sn = isSoon(d);
              const cls = `jt ${ok ? "ok" : cur ? "cur" : sn ? "soon" : ""}`;
              const label = `${i + 1}. ${d.t}${sn ? " (coming soon)" : ""}`;
              if (sn)
                return <button key={d.id} type="button" className={cls} title={label} aria-label={`Lesson ${i + 1}: ${d.t}`} onClick={soonToast} data-testid={`journey-tile-${i + 1}`}>{i + 1}</button>;
              return (
                <Link key={d.id} href={`/lessons/${d.id}`} className={cls} title={label} aria-label={`Lesson ${i + 1}: ${d.t}`} style={{ ...noLine, display: "grid", placeItems: "center" }} data-testid={`journey-tile-${i + 1}`}>
                  {ok ? "✓" : i + 1}
                </Link>
              );
            })}
          </div>
          <div className="jleg"><span><i className="ok" />Done</span><span><i className="cur" />Up next</span><span><i />To do</span><span><i className="soon" />Coming soon</span></div>
          <div className="row jft">
            <span className="mu grow">Tap a square to open that lesson.</span>
            <Link href="/learn" className="btn g s" style={noLine} data-testid="journey-browse-link">Browse all lessons ›</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
