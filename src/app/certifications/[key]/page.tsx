"use client";

import PageLoading from "@/components/PageLoading";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { findCert } from "@/lib/certs";
import { getPath } from "@/lib/paths";
import { useAppData } from "@/lib/use-app-data";

const input = "w-full border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

function CertDetail() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  const { data, saveCerts } = useAppData(false);
  const cert = findCert(key);
  const saved = data?.me.certs?.[key];
  const [date, setDate] = useState("");
  const [url, setUrl] = useState("");
  const [cid, setCid] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [filled, setFilled] = useState(false);

  useEffect(() => { if (data && !cert) router.replace("/certifications"); }, [data, cert, router]);
  // Fill the form once with what is already saved.
  useEffect(() => {
    if (data && !filled) { setDate(saved?.date ?? ""); setUrl(saved?.url ?? ""); setCid(saved?.cid ?? ""); setFilled(true); }
  }, [data, saved, filled]);

  if (!data || !cert) return <PageLoading />;
  const { me } = data;
  const earned = !!saved?.earned;

  async function save() {
    setMsg("");
    const link = url.trim();
    if (!date) return setMsg("Pick the date you earned it.");
    if (date > new Date().toISOString().slice(0, 10)) return setMsg("The date cannot be in the future.");
    if (!link) return setMsg("Paste your certificate link from Katalon Academy.");
    if (!/^https?:\/\//i.test(link)) return setMsg("The link must start with https://");
    setBusy(true);
    const ok = await saveCerts({ ...me.certs, [key]: { ...saved, earned: true, date, url: link, cid: cid.trim() } });
    setBusy(false);
    setMsg(ok ? "Saved! 🎉" : "Could not save. Please try again.");
  }

  async function remove() {
    if (!window.confirm("Remove this certificate?")) return;
    setBusy(true);
    const ok = await saveCerts({ ...me.certs, [key]: { ...saved, earned: false, date: "", url: "", cid: "" } });
    setBusy(false);
    if (ok) { setDate(""); setUrl(""); setCid(""); setMsg("Certificate removed."); } else setMsg("Could not remove. Please try again.");
  }

  return (
    <>
      <AppHeader active="/certifications" />
      <main data-testid="certifications-key-main-1" className="mx-auto max-w-2xl px-4 py-5">
        <Link href="/certifications" className="mb-3 inline-block bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700" data-testid="certs-back-link">← All certifications</Link>
        <section data-testid="certifications-key-section-1" className="border border-slate-200 bg-white p-5 shadow-md" style={{ borderTop: `4px solid ${cert.c}` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold" data-testid="cert-title">{cert.t}</h1>
              <p className="text-sm text-slate-500">Solution: {cert.s}</p>
            </div>
            {earned && <span className="bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800" data-testid="cert-earned-badge">🏅 Earned</span>}
          </div>
          <p className="mt-3 text-sm text-slate-600" data-testid="cert-summary">
            {earned ? <>Earned on <b>{saved?.date}</b>{saved?.url && <> · <a className="font-semibold text-indigo-600 underline" data-testid="cert-view-link" href={saved.url} target="_blank" rel="noopener noreferrer">View certificate ↗</a></>}{saved?.cid && <> · ID: {saved.cid}</>}</> : "Not earned yet"}
            {" · "}<a className="font-semibold text-indigo-600 underline" data-testid="cert-about-link" href={cert.u} target="_blank" rel="noopener noreferrer">About this certification ↗</a>
          </p>
          {getPath(key) && <p className="mt-2"><Link href={`/paths/${key}`} data-testid="cert-path-link" className="font-semibold text-indigo-600 underline">See the learning path for this certification ›</Link></p>}

          <details open={!earned} className="mt-4 border border-slate-200">
            <summary className="cursor-pointer p-3 font-semibold">{earned ? "Edit certificate" : "Add certificate"}</summary>
            <div className="grid gap-1.5 px-3 pb-3">
              <label data-testid="label-cd" htmlFor="cd" className="text-sm font-semibold">Date earned</label>
              <input id="cd" type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} data-testid="cert-date-input" />
              <label data-testid="label-cu" htmlFor="cu" className="mt-1 text-sm font-semibold">Certificate link (from Katalon Academy)</label>
              <input id="cu" className={input} placeholder="https://academy.katalon.com/…" value={url} onChange={(e) => setUrl(e.target.value)} data-testid="cert-link-input" />
              <label data-testid="label-ci" htmlFor="ci" className="mt-1 text-sm font-semibold">Certificate ID (optional)</label>
              <input id="ci" className={input} value={cid} onChange={(e) => setCid(e.target.value)} data-testid="cert-id-input" />
              {msg && <p role="alert" className={`text-sm font-medium ${msg.startsWith("Saved") || msg.endsWith("removed.") ? "text-teal-700" : "text-red-600"}`} data-testid="cert-message">{msg}</p>}
              <div className="mt-1 flex flex-wrap gap-2">
                <button onClick={save} disabled={busy} data-testid="cert-save-button" className="bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2 font-semibold text-white shadow-lg shadow-indigo-300/50 disabled:opacity-60">{earned ? "Save changes" : "Save certificate"}</button>
                {earned && <button onClick={remove} disabled={busy} data-testid="cert-remove-button" className="border border-red-300 bg-red-50 px-4 py-2 font-semibold text-red-700 disabled:opacity-60">Remove</button>}
              </div>
            </div>
          </details>
        </section>
        <p className="mt-3 text-sm text-slate-500">Find your certificate in Katalon Academy under Dashboard → Certifications → Certificates and Badges.</p>
      </main>
    </>
  );
}

export default function CertDetailPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CertDetail />
    </Suspense>
  );
}
