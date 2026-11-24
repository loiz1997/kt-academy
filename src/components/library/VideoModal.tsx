"use client";

import { useEffect, useState } from "react";
import { embedUrl, fileUrl, type LibItem } from "@/lib/library";

// Plays a video inside the page: YouTube/Vimeo links, or an old uploaded file.
export default function VideoModal({ item, onClose }: { item: LibItem; onClose: () => void }) {
  const [src, setSrc] = useState("");
  const embed = item.path ? "" : embedUrl(item.link);

  useEffect(() => {
    if (item.path) fileUrl(item).then(setSrc);
  }, [item]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" data-testid="video-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="min-w-0 flex-1 truncate text-lg font-extrabold text-slate-900" data-testid="video-modal-title">{item.title}</h2>
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" data-testid="video-modal-open-link" className="shrink-0 border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">Open on its site ↗</a>}
          <button type="button" onClick={onClose} data-testid="video-modal-close" aria-label="Close" className="shrink-0 border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">✕</button>
        </div>
        {item.path ? (
          src ? <video src={src} controls autoPlay playsInline className="max-h-[70vh] w-full bg-black" /> : <p className="text-slate-500">Loading video…</p>
        ) : embed ? (
          <div className="relative aspect-video w-full bg-black">
            <iframe src={embed} title={item.title} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" className="absolute inset-0 h-full w-full" />
          </div>
        ) : (
          <p className="text-slate-500">This video is hosted on another site. Use “Open on its site”.</p>
        )}
        {item.descr && <p className="mt-3 text-sm text-slate-500">{item.descr}</p>}
      </div>
    </div>
  );
}
