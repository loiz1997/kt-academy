"use client";

import PageLoading from "@/components/PageLoading";
import { Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import PathView from "@/components/path/PathView";
import { findCert } from "@/lib/certs";
import { getPath } from "@/lib/paths";
import { useAppData } from "@/lib/use-app-data";

function PathPage() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  const { data } = useAppData(false);
  const cert = findCert(key);
  const path = getPath(key);

  useEffect(() => { if (data && (!cert || !path)) router.replace("/paths"); }, [data, cert, path, router]);
  if (!data || !cert || !path) return <PageLoading />;

  return (
    <>
      <AppHeader active="/learn" />
      <main data-testid="paths-key-main-1" className="mx-auto max-w-5xl px-4 py-5">
        <PathView cert={cert} path={path} earned={!!data.me.certs?.[key]?.earned} />
      </main>
    </>
  );
}

export default function PathDetailPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PathPage />
    </Suspense>
  );
}
