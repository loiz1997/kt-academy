"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ALL_TRIBES, TRACKS } from "@/lib/tribes";

type Mini = { id: string; track: string; info: Record<string, unknown> | null };

// Shown once after the first login, when the trainee has no tribe yet.
export default function OnboardingModal({ me, onClose }: { me: Mini; onClose: () => void }) {
  const [tribe, setTribe] = useState("");
  const [track, setTrack] = useState(me.track || "Both");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!tribe) return setError("Please choose your tribe.");
    setBusy(true);
    setError("");
    const info = { ...(me.info ?? {}), team: tribe };
    const { error: e } = await createClient().from("profiles").update({ track, info }).eq("id", me.id);
    setBusy(false);
    if (e) return setError("Could not save. Please try again.");
    window.location.reload(); // the page reads the new tribe and track
  }

  const field = "mt-1 mb-3 w-full border border-slate-300 bg-white px-3 py-2 text-slate-900";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" data-testid="onboarding-modal" role="dialog" aria-modal="true" aria-label="One last step">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="text-xl font-extrabold text-slate-900">One last step 👋</h2>
        <p className="mb-3 text-sm text-slate-500">Pick your tribe and learning track so we can set up your dashboard.</p>
        <label className="text-sm font-semibold text-slate-700" htmlFor="onb-tribe">Your tribe</label>
        <select id="onb-tribe" value={tribe} onChange={(e) => setTribe(e.target.value)} data-testid="onboarding-tribe-select" className={field}>
          <option value="">Select your tribe</option>
          {ALL_TRIBES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className="text-sm font-semibold text-slate-700" htmlFor="onb-track">Learning track</label>
        <select id="onb-track" value={track} onChange={(e) => setTrack(e.target.value)} data-testid="onboarding-track-select" className={field}>
          {TRACKS.map((t) => <option key={t}>{t}</option>)}
        </select>
        {error && <p className="mb-2 text-sm font-semibold text-red-600" data-testid="onboarding-error">{error}</p>}
        <div className="mt-2 flex items-center justify-between">
          <button type="button" onClick={onClose} data-testid="onboarding-later-button" className="text-sm font-semibold text-slate-500 underline">Later</button>
          <button type="button" onClick={save} disabled={busy} data-testid="onboarding-save-button" className="bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60">
            {busy ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
