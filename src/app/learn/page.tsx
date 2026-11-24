"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { CERTS } from "@/lib/certs";
import { activeDocs } from "@/lib/lessons";
import { useLibrary } from "@/lib/library";
import { certsEarned, lessonsDone } from "@/lib/progress";
import pathsData from "@/data/paths.json";
import { useAppData } from "@/lib/use-app-data";

type CardProps = { cl: string; href: string; id: string; icon: string; title: string; text: string; pills: string[]; cta: string };

function HubCard({ cl, href, id, icon, title, text, pills, cta }: CardProps) {
  return (
    <Link href={href} className={`hcard ${cl}`} data-testid={id}>
      <div className="big" aria-hidden="true">{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="pills">{pills.map((p) => <span key={p}>{p}</span>)}</div>
      <div className="hcta"><span className="btn lt">{cta}</span></div>
    </Link>
  );
}

export default function LearnPage() {
  const { data } = useAppData(false);
  const { items } = useLibrary();
  if (!data) return <PageLoading />;
  const { me, docs } = data;
  const admin = me.role === "admin";
  const total = activeDocs(docs).length;
  const done = lessonsDone(me, docs);
  const ready = Object.keys(pathsData).length;
  const earned = certsEarned(me);
  const nv = (items ?? []).filter((x) => x.kind === "video").length;
  const nd = (items ?? []).filter((x) => x.kind === "doc").length;

  return (
    <>
      <AppHeader active="/learn" />
      <main>
        <h1 className="text-2xl font-extrabold" data-testid="learn-title">Learning &amp; Tools</h1>
        <p className="mu" style={{ margin: "4px 0 18px" }} data-testid="learn-subtitle">
          {admin ? "Manage what your trainees learn, or browse it as they see it." : "What would you like to do today? Pick one to get started."}
        </p>
        <div className="hub" data-testid="learn-hub">
          <HubCard cl="hc1" href="/paths" id="learn-paths-link" icon="🏅" title="Certification path" text="Follow a step-by-step plan to earn an official Katalon certification."
            pills={[`${CERTS.length} certifications`, `${ready} ready`, `${earned} earned`]} cta="Choose a certification ›" />
          <HubCard cl="hc2" href="/lessons" id="learn-lessons-link" icon="📘" title="KT lessons" text="Beginner-friendly guides to install, set up and start using Katalon."
            pills={[`${done} of ${total} completed`, "More coming soon"]} cta="Browse lessons ›" />
          <HubCard cl="hc3" href="/videos" id="learn-videos-link" icon="🎬" title="Video tutorials" text="Short walkthroughs you can watch at your own pace."
            pills={[`${nv} ${nv === 1 ? "video" : "videos"}`, ...(admin ? ["You can add videos"] : [])]} cta={admin ? "Manage videos ›" : "Watch videos ›"} />
          <HubCard cl="hc4" href="/documents" id="learn-documents-link" icon="📎" title="KT documents" text="Guides and files shared by your KT lead, ready to download."
            pills={[`${nd} ${nd === 1 ? "document" : "documents"}`, ...(admin ? ["You can add links"] : [])]} cta={admin ? "Manage documents ›" : "Open documents ›"} />
        </div>
      </main>
    </>
  );
}
