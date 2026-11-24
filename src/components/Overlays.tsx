"use client";

import { useEffect, useState } from "react";
import { closeToast, onLoading, onToast, type LoadingState, type ToastState } from "@/lib/overlay";

// The signing-in / saving screen and the toast messages. Mounted once in the root layout.
export default function Overlays() {
  const [ld, setLd] = useState<LoadingState>(null);
  const [tt, setTt] = useState<ToastState>(null);
  useEffect(() => {
    const a = onLoading(setLd);
    const b = onToast(setTt);
    return () => { a(); b(); };
  }, []);
  return (
    <>
      {ld && (
        <div className="ldg sgn" role="status" aria-live="polite" data-testid="loading-overlay">
          <div className="sgn-box">
            <div className="sgn-orb" aria-hidden="true">
              <i className="r r3" /><i className="r" /><i className="r r2" />
              <svg className="kl-logo" viewBox="0 0 64 64" width="64" height="64">
                <defs>
                  <linearGradient id="sgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b7bff" /><stop offset="1" stopColor="#14c8b4" /></linearGradient>
                </defs>
                <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="rgba(255,255,255,.08)" stroke="url(#sgg)" strokeWidth="3.5" strokeLinejoin="round" />
                <path className="kl-check" d="M21 33 L29 41 L44 25" stroke="url(#sgg)" />
              </svg>
            </div>
            <b data-testid="loading-title">{ld.title || "Loading…"}</b>
            <span data-testid="loading-sub">{ld.sub}</span>
            <div className="sgn-bar"><i /></div>
            {ld.cancel && <a className="ldcancel" onClick={ld.cancel} data-testid="loading-cancel">Cancel</a>}
          </div>
        </div>
      )}
      {tt && (
        <div className={`toast${tt.cls ? " " + tt.cls : ""}`} role="status" data-testid="toast">
          <div className="ti">{tt.icon}</div>
          <div className="tb"><b data-testid="toast-title">{tt.title}</b><span data-testid="toast-message">{tt.msg}</span></div>
          <button onClick={closeToast} aria-label="Close" data-testid="toast-close">×</button>
        </div>
      )}
    </>
  );
}
