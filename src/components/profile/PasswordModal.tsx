"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEMO } from "@/lib/demo";

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
    if (DEMO) return setError("Changing the password is turned off in the demo.");
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

  const [show, setShow] = useState(false);
  const score = [pw.length >= 6, pw.length >= 10, /[A-Z]/.test(pw) && /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const bar = !pw ? [0, "transparent"] : score <= 1 ? [25, "#e5484d"] : score <= 3 ? [60, "#f59e0b"] : [100, "#16a36a"];
  const type = show ? "text" : "password";
  const Field = ({ id, label, value, set, tid, auto, extra }: { id: string; label: string; value: string; set: (v: string) => void; tid: string; auto: string; extra?: React.ReactNode }) => (
    <div className="pwm-f">
      <label htmlFor={id}>{label}</label>
      <div className="pwm-w">
        <input id={id} type={type} autoComplete={auto} value={value} onChange={(e) => set(e.target.value)} data-testid={tid} />
      </div>
      {extra}
    </div>
  );
  return (
    <div className="pwm" data-testid="password-modal" role="dialog" aria-modal="true" aria-label="Change password" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pwm-box">
        <div className="pwm-top">
          <div className="pwm-ic" aria-hidden="true">🔒</div>
          <div><h2>Change password</h2><p>Confirm your current password, then choose a new one.</p></div>
        </div>
        <div className="pwm-body">
          {Field({ id: "pw-cur", label: "Current password", value: cur, set: setCur, tid: "pw-current-input", auto: "current-password" })}
          {Field({ id: "pw-new", label: "New password", value: pw, set: setPw, tid: "pw-new-input", auto: "new-password", extra: (<><div className="pwm-str" aria-hidden="true"><i style={{ width: `${bar[0]}%`, background: String(bar[1]) }} /></div><div className="pwm-hint">At least 6 characters. Longer with numbers and symbols is stronger.</div></>) })}
          {Field({ id: "pw-new2", label: "Confirm new password", value: pw2, set: setPw2, tid: "pw-confirm-input", auto: "new-password" })}
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--mu)", cursor: "pointer" }}>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} data-testid="pw-show-toggle" /> Show passwords
          </label>
          {error && <p className="pwm-err" role="alert" data-testid="pw-error">{error}</p>}
          {ok && <p className="pwm-ok" data-testid="pw-success">{ok}</p>}
          <div className="pwm-act">
            <button type="button" className="c" onClick={onClose} data-testid="pw-cancel-button">Cancel</button>
            <button type="button" className="s" onClick={save} disabled={busy || !!ok} data-testid="pw-save-button">{busy ? "Saving…" : "Update password"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
