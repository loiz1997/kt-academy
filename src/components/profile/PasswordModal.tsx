"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Change password: first confirm the current one, then save the new one (min. 6 characters).
export default function PasswordModal({ email, onClose }: { email: string; onClose: () => void }) {
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setError("");
    if (!cur) return setError("Please enter your current password.");
    if (pw.length < 6) return setError("The new password needs at least 6 characters.");
    if (pw !== pw2) return setError("The two new passwords do not match.");
    setBusy(true);
    const sb = createClient();
    const chk = await sb.auth.signInWithPassword({ email, password: cur });
    if (chk.error) {
      setBusy(false);
      return setError("Your current password is not correct.");
    }
    const { error: e } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    if (e) return setError(e.message || "Could not change the password.");
    setOk("Password updated ✓");
    setTimeout(onClose, 1200);
  }

  const field = "mt-1 mb-3 w-full border border-slate-300 bg-white px-3 py-2 text-slate-900";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" data-testid="password-modal" role="dialog" aria-modal="true" aria-label="Change password">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="mb-3 text-xl font-extrabold text-slate-900">🔒 Change password</h2>
        <label className="text-sm font-semibold text-slate-700" htmlFor="pw-cur">Current password</label>
        <input id="pw-cur" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} data-testid="pw-current-input" className={field} />
        <label className="text-sm font-semibold text-slate-700" htmlFor="pw-new">New password</label>
        <input id="pw-new" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} data-testid="pw-new-input" className={field} />
        <label className="text-sm font-semibold text-slate-700" htmlFor="pw-new2">Confirm new password</label>
        <input id="pw-new2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} data-testid="pw-confirm-input" className={field} />
        {error && <p className="mb-2 text-sm font-semibold text-red-600" data-testid="pw-error">{error}</p>}
        {ok && <p className="mb-2 text-sm font-semibold text-green-700" data-testid="pw-success">{ok}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} data-testid="pw-cancel-button" className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
          <button type="button" onClick={save} disabled={busy || !!ok} data-testid="pw-save-button" className="bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60">
            {busy ? "Saving…" : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}
