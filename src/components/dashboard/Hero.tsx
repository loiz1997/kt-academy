import Link from "next/link";
import Ring from "./Ring";
import { CERTS } from "@/lib/certs";
import { activeDocs } from "@/lib/lessons";
import { certsEarned, lessonsDone, nextLesson, overallProgress } from "@/lib/progress";
import type { Doc, Profile } from "@/lib/types";

export default function Hero({ me, docs, score }: { me: Profile; docs: Doc[]; score: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = (me.name || me.email).split(" ")[0];
  const next = nextLesson(me, docs);

  const Chip = ({ icon, value, label, id, children }: { icon: string; value: string | number; label: string; id: string; children?: React.ReactNode }) => (
    <div className="uhc" data-testid={id}>
      <span className="ic">{icon}</span>
      <div><b>{value}</b><span>{label}{children}</span></div>
    </div>
  );

  return (
    <section className="uh" data-testid="dashboard-hero">
      <div className="uhm">
        <div className="uhl">
          <div className="mu2">{greeting}</div>
          <h1 data-testid="dashboard-greeting">{first} 👋</h1>
          <p data-testid="dashboard-next-up">
            {!docs.length ? "No KT documents have been added yet. Check back soon." : next ? <>Next up: <b>{next.t}</b></> : "You have finished every available lesson. More are coming soon!"}
          </p>
          {next ? (
            <Link href={`/lessons/${next.id}`} className="btn lt" style={{ textDecoration: "none", display: "inline-block" }} data-testid="dashboard-continue-button">▶ Continue learning</Link>
          ) : (
            <Link href="/certifications" className="btn lt" style={{ textDecoration: "none", display: "inline-block" }} data-testid="dashboard-certs-button">🏅 Add your certificates</Link>
          )}
        </div>
        <div className="uhr"><Ring percent={overallProgress(me, docs)} /></div>
      </div>
      <div className="uhs">
        <Chip id="stat-lessons-done" icon="📘" value={`${lessonsDone(me, docs)}/${activeDocs(docs).length}`} label="Lessons done" />
        <Chip id="stat-certificates" icon="🏅" value={`${certsEarned(me)}/${CERTS.length}`} label="Certificates" />
        <Chip id="stat-score" icon="⭐" value={score} label="Score points" />
        <Chip id="stat-track" icon="🧭" value={me.track} label="Your track · ">
          <Link href="/profile" data-testid="stat-track-change-link">change</Link>
        </Chip>
      </div>
    </section>
  );
}
