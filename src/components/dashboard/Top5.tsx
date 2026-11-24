import Av from "./Av";
import { scoreOf, topFive } from "@/lib/progress";
import type { Doc, Learner } from "@/lib/types";

export default function Top5({ learners, docs, meId, myScore, admin }: { learners: Learner[]; docs: Doc[]; meId: string; myScore: number; admin?: boolean }) {
  const top = topFive(learners, docs);
  const inTop = top.some((x) => x.u.id === meId);
  const msg = admin ? "By approved score" : inTop ? "You are in! Keep going 🎉" : `Get work approved to join${myScore ? ` (${myScore} pts)` : ""}`;

  return (
    <div className="t5" data-testid="top5-section">
      <div className="t5h">
        <span className="t5i">🏆</span>
        <div><b>Top 5</b><span>{msg}</span></div>
      </div>
      <div className="t5r">
        {[0, 1, 2, 3, 4].map((i) => {
          const x = top[i];
          if (!x)
            return (
              <div key={i} className="t5c e" data-testid="top5-empty-chip">
                <div className="t5a"><div className="av">?</div><span className="pr">{i + 1}</span></div>
                <div className="t5t"><b>Open</b><span>spot</span></div>
              </div>
            );
          const mine = x.u.id === meId;
          return (
            <div key={x.u.id} className={`t5c r${i + 1}${mine ? " me" : ""}`} title={`${x.u.name} · ${scoreOf(x.u)} pts`} data-testid={`top5-chip-${i + 1}`}>
              {i === 0 && <span className="t5k">👑</span>}
              <div className="t5a"><Av name={x.u.name} src={x.u.info?.avatar} /><span className="pr">{i + 1}</span></div>
              <div className="t5t"><b>{mine ? "You" : String(x.u.name || "").split(" ")[0]}</b><span>{scoreOf(x.u)} pts</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
