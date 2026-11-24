"use client";

import Link from "next/link";
import { useState } from "react";
import AuthCard, { authButton, authInput } from "@/components/AuthCard";
import { hideLoading, showLoading } from "@/lib/overlay";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    const mail = email.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(mail)) return setError("Enter a valid email address.");
    setBusy(true);
    showLoading("Sending your reset link…", "", 300);
    const { error } = await createClient().auth.resetPasswordForEmail(mail, { redirectTo: `${window.location.origin}/reset` });
    setBusy(false);
    hideLoading();
    if (error && /rate|limit|seconds/i.test(error.message)) return setError("Too many requests. Please wait a while and try again.");
    setOk("If that email has an account, a reset link is on its way. Check your inbox and spam folder.");
  }

  return (
    <AuthCard variant="forgot" title="Forgot your password?" subtitle="Enter your email and we will send you a link to choose a new one." onSubmit={submit}>
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input className={authInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="forgot-email-input" autoComplete="email" />
      </label>
      {error && <p role="alert" className="text-sm font-medium text-red-600" data-testid="forgot-error-message">{error}</p>}
      {ok && <p className="text-sm font-medium text-teal-700" data-testid="forgot-success-message">{ok}</p>}
      <button type="submit" disabled={busy} data-testid="forgot-submit-button" className={authButton}>{busy ? "Sending…" : "Send reset link"}</button>
      <p className="text-center text-sm text-slate-600"><Link href="/login" data-testid="forgot-back-link" className="font-semibold text-indigo-600 underline">← Back to log in</Link></p>
    </AuthCard>
  );
}
