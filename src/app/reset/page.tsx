"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard, { authButton, authInput } from "@/components/AuthCard";
import { hideLoading, showLoading } from "@/lib/overlay";
import { createClient } from "@/lib/supabase/client";

// The link in the reset email opens this page and signs the person in for a moment, just to set a new password.
export default function ResetPage() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = createClient();
    const { data: sub } = sb.auth.onAuthStateChange((ev, ses) => { if (ses && (ev === "PASSWORD_RECOVERY" || ev === "SIGNED_IN")) setReady(true); });
    sb.auth.getSession().then(({ data }) => setReady((r) => (r === true ? r : !!data.session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (p1.length < 6) return setError("Password needs 6+ characters.");
    if (p1 !== p2) return setError("Passwords do not match.");
    setBusy(true);
    showLoading("Saving your new password…", "", 300);
    const { error } = await createClient().auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) { hideLoading(); return setError(error.message); }
    showLoading("Signing you in…", "Almost there");
    router.push("/dashboard");
  }

  if (ready === false) {
    return (
      <AuthCard variant="forgot" title="Link expired" subtitle="This reset link is not valid any more." onSubmit={(e) => e.preventDefault()}>
        <p className="text-sm text-slate-600" data-testid="reset-expired-message">Please ask for a new one.</p>
        <Link href="/forgot" data-testid="reset-request-new-link" className="block text-center font-semibold text-indigo-600 underline">Send a new reset link</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard variant="forgot" title="Set a new password" subtitle="Choose a password you have not used here before." onSubmit={submit}>
      <label data-testid="reset-label-1" className="block text-sm font-medium text-slate-700">
        New password (min 6)
        <input className={authInput} type="password" value={p1} onChange={(e) => setP1(e.target.value)} data-testid="reset-password-input" autoComplete="new-password" />
      </label>
      <label data-testid="reset-label-2" className="block text-sm font-medium text-slate-700">
        Confirm new password
        <input className={authInput} type="password" value={p2} onChange={(e) => setP2(e.target.value)} data-testid="reset-confirm-input" autoComplete="new-password" />
      </label>
      {error && <p role="alert" className="text-sm font-medium text-red-600" data-testid="reset-error-message">{error}</p>}
      <button type="submit" disabled={busy || ready === null} data-testid="reset-submit-button" className={authButton}>{busy ? "Saving…" : "Save new password"}</button>
    </AuthCard>
  );
}
