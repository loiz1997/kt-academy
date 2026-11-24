"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard, { authButton, authInput } from "@/components/AuthCard";
import { createClient } from "@/lib/supabase/client";
import { ALL_TRIBES } from "@/lib/tribes";

type Mode = "login" | "signup" | "verify";

const rememberTribe = (t: string) => {
  try { if (t) localStorage.setItem("kt-pending-tribe", t); } catch {}
};

function PasswordField({ id, value, onChange, auto }: { id: string; value: string; onChange: (v: string) => void; auto: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input className={`${authInput} pr-16`} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} data-testid={`${id}-password-input`} autoComplete={auto} />
      <button type="button" onClick={() => setShow(!show)} data-testid={`${id}-password-toggle`} aria-label={show ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-500">
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tribe, setTribe] = useState("");
  const [track, setTrack] = useState("Both");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // Coming back from Google/GitHub: show any error Supabase sent, or continue when the sign-in worked.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const err = q.get("error_description") || h.get("error_description") || q.get("error") || h.get("error");
    if (err) {
      setError(decodeURIComponent(err.replace(/\+/g, " ")));
      window.history.replaceState(null, "", "/login");
      return;
    }
    if (q.get("code") || h.get("access_token")) {
      createClient().auth.getSession().then(({ data }) => {
        if (data.session) router.replace("/dashboard");
        else setError("Sign-in did not finish. Please try again.");
      });
    }
  }, [router]);

  const p = mode === "signup" ? "signup" : "login";
  const switchTo = (m: Mode) => { setMode(m); setError(""); setInfo(""); };

  async function oauth(provider: "google" | "github") {
    setError("");
    if (mode === "signup") rememberTribe(tribe);
    const { error } = await createClient().auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/login` } });
    if (error) setError(error.message || "Could not start sign-in.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    const supabase = createClient();

    if (mode === "verify") {
      const token = code.replace(/\s/g, "");
      if (token.length < 6) return setError("Enter the code from your email.");
      setBusy(true);
      const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
      setBusy(false);
      if (error) return setError("Invalid or expired code. Try again or resend.");
      return router.push("/dashboard");
    }

    if (!email || !password) return setError("Enter your email and password.");
    if (mode === "signup") {
      if (!name.trim()) return setError("Enter your name.");
      if (password.length < 6) return setError("Use a password with 6 or more characters.");
      if (!tribe) return setError("Please choose your tribe.");
    }
    setBusy(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        if (/not confirmed/i.test(error.message)) {
          await supabase.auth.resend({ type: "signup", email });
          setMode("verify");
          return setInfo("Your email is not confirmed yet. We sent you a new code.");
        }
        return setError("Wrong email or password.");
      }
      router.push("/dashboard");
    } else {
      rememberTribe(tribe);
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: name.trim(), track } } });
      setBusy(false);
      if (error) return setError(error.message);
      if (!data.session) {
        setMode("verify");
        return setInfo(`We sent a 6-digit code to ${email}. Enter it below to finish signing up.`);
      }
      router.push("/dashboard");
    }
  }

  async function resend() {
    setError("");
    const { error } = await createClient().auth.resend({ type: "signup", email });
    if (error) setError(error.message);
    else setInfo("A new code is on its way.");
  }

  const subtitle = mode === "login" ? "Welcome back! Log in to keep learning." : mode === "signup" ? "Create your account to start learning." : "Check your email to finish signing up.";

  return (
    <AuthCard subtitle={subtitle} onSubmit={submit}>
      {mode !== "verify" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => oauth("google")} data-testid={`${p}-google-button`} className="flex items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <b className="text-base text-[#4285F4]">G</b> Google
            </button>
            <button type="button" onClick={() => oauth("github")} data-testid={`${p}-github-button`} className="flex items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
              GitHub
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or with email<span className="h-px flex-1 bg-slate-200" /></div>
        </>
      )}

      {mode === "signup" && (
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input className={authInput} value={name} onChange={(e) => setName(e.target.value)} data-testid="signup-name-input" autoComplete="name" />
        </label>
      )}

      {mode !== "verify" ? (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input className={authInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid={`${p}-email-input`} autoComplete="email" />
          </label>
          <div className="block text-sm font-medium text-slate-700">
            <label htmlFor={`${p}-pw`}>Password</label>
            <div id={`${p}-pw`}><PasswordField id={p} value={password} onChange={setPassword} auto={mode === "login" ? "current-password" : "new-password"} /></div>
            {mode === "login" && (
              <div className="mt-1 text-right"><Link href="/forgot" data-testid="login-forgot-link" className="text-xs font-semibold text-indigo-600 underline">Forgot password?</Link></div>
            )}
          </div>
        </>
      ) : (
        <label className="block text-sm font-medium text-slate-700">
          Verification code
          <input className={`${authInput} text-center text-2xl tracking-[.35em]`} inputMode="numeric" autoComplete="one-time-code" maxLength={8} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} data-testid="signup-code-input" />
        </label>
      )}

      {mode === "signup" && (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Your tribe
            <select className={authInput} value={tribe} onChange={(e) => setTribe(e.target.value)} data-testid="signup-tribe-select">
              <option value="">Select your tribe</option>
              {ALL_TRIBES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Track
            <select className={authInput} value={track} onChange={(e) => setTrack(e.target.value)} data-testid="signup-track-select">
              <option>Both</option>
              <option>Local</option>
              <option>TestOps</option>
            </select>
          </label>
        </>
      )}

      {error && <p role="alert" className="text-sm font-medium text-red-600" data-testid={mode === "verify" ? "signup-error-message" : `${p}-error-message`}>{error}</p>}
      {info && <p className="text-sm font-medium text-teal-700" data-testid="signup-info-message">{info}</p>}

      <button type="submit" disabled={busy} data-testid={mode === "verify" ? "signup-verify-button" : `${p}-submit-button`} className={authButton}>
        {busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Verify & continue"}
      </button>

      {mode === "verify" ? (
        <p className="text-center text-sm text-slate-600">
          No email yet?{" "}
          <button type="button" onClick={resend} data-testid="signup-resend-link" className="font-semibold text-indigo-600 underline">Resend code</button>
          {" · "}
          <button type="button" onClick={() => switchTo("signup")} data-testid="signup-change-email-link" className="font-semibold text-indigo-600 underline">Use a different email</button>
        </p>
      ) : (
        <p className="text-center text-sm text-slate-600">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button type="button" className="font-semibold text-indigo-600 underline" data-testid={mode === "login" ? "login-go-to-signup-link" : "signup-go-to-login-link"} onClick={() => switchTo(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      )}
    </AuthCard>
  );
}
