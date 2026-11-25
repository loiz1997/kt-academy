"use client";

import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { CERTS } from "@/lib/certs";
import { certsEarned } from "@/lib/progress";
import { useAppData } from "@/lib/use-app-data";

export default function CertificationsPage() {
  const { data } = useAppData(false);
  if (!data) return <PageLoading />;
  const { me } = data;

  return (
    <>
      <AppHeader active="/certifications" />
      <main data-testid="certifications-main-1" className="mx-auto max-w-5xl px-4 py-5">
        <h1 className="text-2xl font-extrabold text-slate-900" data-testid="certs-title">My Certifications</h1>
        <p className="mb-4 text-slate-500" data-testid="certs-count">
          {certsEarned(me)} of {CERTS.length} earned · Tap a certification to view or add your certificate.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CERTS.map((c) => {
            const earned = !!me.certs?.[c.k]?.earned;
            return (
              <Link key={c.k} href={`/certifications/${c.k}`} data-testid={`cert-card-${c.k}`} className="border border-slate-200 bg-white p-4 shadow-md hover:shadow-lg" style={{ borderTop: `4px solid ${c.c}` }}>
                <span className="grid h-10 w-10 place-items-center text-xl text-white" style={{ background: c.c }}>🏅</span>
                <h2 data-testid={`cert-title-${c.k}`} className="mt-2.5 text-[15px] font-bold text-slate-900">{c.t}</h2>
                <p className="text-sm text-slate-500">{c.s}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  {earned ? <span className="bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800" data-testid={`cert-earned-${c.k}`}>🏅 Earned</span> : <span className="bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Not earned yet</span>}
                  <span className="text-slate-500">Open ›</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
