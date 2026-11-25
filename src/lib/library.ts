"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { DEMO } from "./demo";

export type LibItem = {
  id: number;
  kind: "video" | "doc";
  title: string;
  descr: string;
  cat: string;
  link: string;
  path: string; // old uploaded file in storage (new items are links only)
  fname: string;
  ftype: string;
  size: number;
  created_at: string;
};

export type LibRecord = { title: string; descr: string; link: string; cat?: string };

export const VIDEO_CATS = ["General", "Local", "TestOps", "Tools", "Certification"];

export const fmtDate = (d?: string | null) => {
  try { return new Date(d ?? "").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return ""; }
};
export const fmtSize = (b: number) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round((b || 0) / 1024)) + " KB");
export const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
export const fileIcon = (name: string) =>
  ({ pdf: "📕", doc: "📘", docx: "📘", xls: "📗", xlsx: "📗", csv: "📗", ppt: "📙", pptx: "📙", zip: "🗜️" } as Record<string, string>)[(name.split(".").pop() ?? "").toLowerCase()] ?? "📄";

// YouTube and Vimeo links can be played inside the page.
export function embedUrl(u: string) {
  let m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/);
  if (m) return "https://www.youtube.com/embed/" + m[1];
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? "https://player.vimeo.com/video/" + m[1] : "";
}

// Temporary link for a file stored in Supabase (old uploads only).
export async function fileUrl(it: LibItem, download = false) {
  const { data } = await createClient().storage.from("kt-library").createSignedUrl(it.path, 3600, download ? { download: it.fname || true } : undefined);
  return data?.signedUrl ?? "";
}

export function useLibrary() {
  const [items, setItems] = useState<LibItem[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await createClient().from("library").select("*").order("created_at", { ascending: false });
    if (error) {
      setError(/relation|schema cache/i.test(error.message) ? "The library table is not set up yet. Run supabase/supabase-library.sql in Supabase." : error.message);
      setItems([]);
      return;
    }
    setError("");
    setItems((data ?? []) as LibItem[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Adds (id = null) or changes an item. Returns an error text, or "" when it worked.
  const save = useCallback(
    async (kind: "video" | "doc", id: number | null, rec: LibRecord, old?: LibItem | null) => {
      const sb = createClient();
      const row = { ...rec, path: "", fname: "", ftype: "", size: 0 }; // saving a link replaces any old uploaded file
      const r = id ? await sb.from("library").update(row).eq("id", id) : await sb.from("library").insert({ kind, ...row });
      if (r.error) return "Could not save: " + r.error.message;
      if (old?.path) await sb.storage.from("kt-library").remove([old.path]);
      await load();
      return "";
    },
    [load]
  );

  const remove = useCallback(
    async (it: LibItem) => {
      if (DEMO) return "Deleting items is turned off in the demo.";
      const sb = createClient();
      const r = await sb.from("library").delete().eq("id", it.id);
      if (r.error) return "Could not delete: " + r.error.message;
      if (it.path) await sb.storage.from("kt-library").remove([it.path]);
      await load();
      return "";
    },
    [load]
  );

  return { items, error, save, remove };
}
