"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO, DEMO_ADMIN, DEMO_TRAINEE } from "@/lib/demo";
import AuthCard, { authButton, authInput } from "@/components/AuthCard";
import { hideLoading, showLoading } from "@/lib/overlay";
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
      <input className={`${authInput} pr-16`} placeholder="Enter your password" type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} data-testid={`${id}-password-input`} autoComplete={auto} />
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

  // Go straight to the right home: admins to /admin, trainees to /dashboard (no stop in between).
  async function goHome(replace = false) {
    let to = "/dashboard";
    try {
      const sb = createClient();
      const { data: u } = await sb.auth.getUser();
      if (u.user) {
        const { data: p } = await sb.from("profiles").select("role").eq("id", u.user.id).maybeSingle();
        if (p?.role === "admin") to = "/admin";
      }
    } catch {}
    if (replace) router.replace(to);
    else router.push(to);
  }

  // Coming back from Google/GitHub: show any error Supabase sent, or continue when the sign-in worked.
  // Arriving here (for example after Log out): close any loading screen left over from the page before.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (!q.get("code") && !h.get("access_token")) hideLoading();
  }, []);

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
      showLoading("Signing you in…", "Almost there");
      createClient().auth.getSession().then(({ data }) => {
        if (!data.session) { hideLoading(); setError("Sign-in did not finish. Please try again."); return; }
        let helper = false;
        try { const m = localStorage.getItem("kt2_oauth_tab"); helper = !!m && Date.now() - Number(m) < 300000; } catch {}
        if (helper) {
          // This is the new tab: tell the first tab that sign-in worked, then close.
          try { localStorage.removeItem("kt2_oauth_tab"); localStorage.setItem("kt2_oauth_done", String(Date.now())); } catch {}
          showLoading("Signed in ✓", "You can close this tab. Going back to the app…");
          setTimeout(() => { try { window.close(); } catch {} }, 900);
          setTimeout(() => goHome(true), 1800); // if the browser does not allow closing
        } else goHome(true);
      });
    }
  }, [router]);

  const p = mode === "signup" ? "signup" : "login";
  const switchTo = (m: Mode) => { setMode(m); setError(""); setInfo(""); };

  // Google / GitHub open in a new tab; this tab waits and continues when sign-in is done.
  const waiting = useRef(false);
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelOAuth() {
    waiting.current = false;
    if (waitTimer.current) clearTimeout(waitTimer.current);
    try { localStorage.removeItem("kt2_oauth_tab"); } catch {}
    hideLoading();
  }

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== "kt2_oauth_done" || !e.newValue || !waiting.current) return;
      waiting.current = false;
      if (waitTimer.current) clearTimeout(waitTimer.current);
      showLoading("Signing you in…", "Almost there");
      createClient().auth.getSession().then(({ data }) => {
        if (data.session) goHome(true); // the loading screen stays until the dashboard is ready
        else { hideLoading(); setError("Sign-in did not work: no session found."); }
      });
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [router]);

  // Public demo only: one click signs in with a shared sample account.
  async function demoLogin(who: "trainee" | "admin") {
    const acc = who === "admin" ? DEMO_ADMIN : DEMO_TRAINEE;
    setError(""); setBusy(true);
    showLoading("Opening the demo…", who === "admin" ? "Admin view" : "Trainee view");
    const { error } = await createClient().auth.signInWithPassword({ email: acc.email, password: acc.password });
    setBusy(false);
    if (error) { hideLoading(); return setError("The demo is not ready yet. Please try again in a moment."); }
    goHome();
  }

  async function oauth(provider: "google" | "github") {
    setError("");
    if (mode === "signup") rememberTribe(tribe);
    const nm = provider === "google" ? "Google" : "GitHub";
    const redirectTo = `${window.location.origin}/login`;
    const supabase = createClient();
    const fail = (msg?: string) => { hideLoading(); setError(msg || "Could not start sign-in."); };

    let w: Window | null = null;
    try { w = window.open("", "_blank"); } catch {} // opened right away, while the click still counts
    if (!w) {
      // pop-ups blocked: use this tab instead
      showLoading(`Opening ${nm}…`, "You will come back here after signing in");
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
      if (error) fail(error.message);
      return;
    }
    try { w.document.title = `Signing in with ${nm}`; w.document.body.innerHTML = `<p style="font:16px sans-serif;padding:28px;color:#444">Opening ${nm}…</p>`; } catch {}
    waiting.current = true;
    showLoading(`Waiting for ${nm}…`, "Finish signing in in the new tab", 0, cancelOAuth);
    try { localStorage.setItem("kt2_oauth_tab", String(Date.now())); localStorage.removeItem("kt2_oauth_done"); } catch {}
    const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } });
    if (error || !data?.url) {
      try { w.close(); } catch {}
      cancelOAuth();
      return fail(error?.message);
    }
    w.location.href = data.url;
    if (waitTimer.current) clearTimeout(waitTimer.current);
    waitTimer.current = setTimeout(cancelOAuth, 300000);
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
      showLoading("Verifying your code…", "", 300);
      const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
      setBusy(false);
      if (error) { hideLoading(); return setError("Invalid or expired code. Try again or resend."); }
      showLoading("Signing you in…", "Almost there");
      return goHome();
    }

    if (!email || !password) return setError("Enter your email and password.");
    if (mode === "signup") {
      if (!name.trim()) return setError("Enter your name.");
      if (password.length < 6) return setError("Use a password with 6 or more characters.");
      if (!tribe) return setError("Please choose your tribe.");
    }
    setBusy(true);

    if (mode === "login") {
      showLoading("Signing you in…", "Checking your details", 300);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        hideLoading();
        if (/not confirmed/i.test(error.message)) {
          await supabase.auth.resend({ type: "signup", email });
          setMode("verify");
          return setInfo("Your email is not confirmed yet. We sent you a new code.");
        }
        return setError("Wrong email or password.");
      }
      showLoading("Signing you in…", "Almost there"); // stays until the dashboard is ready
      goHome();
    } else {
      rememberTribe(tribe);
      showLoading("Creating your account…", "This only takes a moment", 300);
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: name.trim(), track } } });
      setBusy(false);
      if (error) { hideLoading(); return setError(error.message); }
      if (!data.session) {
        hideLoading();
        setMode("verify");
        return setInfo(`We sent a 6-digit code to ${email}. Enter it below to finish signing up.`);
      }
      showLoading("Signing you in…", "Almost there");
      goHome();
    }
  }

  async function resend() {
    setError("");
    const { error } = await createClient().auth.resend({ type: "signup", email });
    if (error) setError(error.message);
    else setInfo("A new code is on its way.");
  }

  const subtitle = mode === "login" ? "Log in to continue learning." : mode === "signup" ? "Create your account to start learning." : "Check your email to finish signing up.";

  return (
    <AuthCard variant={mode === "login" ? "login" : "signup"} title={mode === "login" ? undefined : mode === "signup" ? "Create your account" : "Check your email"} subtitle={subtitle} onSubmit={submit}>
      {DEMO && mode === "login" && (
        <div className="demo-pick" data-testid="demo-picker">
          <b>Try the live demo</b>
          <span>No sign-up needed. Pick a view:</span>
          <div className="row2">
            <button type="button" className="t" disabled={busy} onClick={() => demoLogin("trainee")} data-testid="demo-trainee-button">🎓 As a trainee</button>
            <button type="button" disabled={busy} onClick={() => demoLogin("admin")} data-testid="demo-admin-button">🛠 As an admin</button>
          </div>
        </div>
      )}
      {mode !== "verify" && (
        <>
          <div className={DEMO ? "hidden" : "grid gap-2.5"}>
            <button type="button" onClick={() => oauth("google")} data-testid={`${p}-google-button`} className="oab">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
              Continue with Google
            </button>
            <button type="button" onClick={() => oauth("github")} data-testid={`${p}-github-button`} className="oab">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
              Continue with GitHub
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or use your work email<span className="h-px flex-1 bg-slate-200" /></div>
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
            Work email
            <input className={authInput} type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} data-testid={`${p}-email-input`} autoComplete="email" />
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
        {busy ? "Please wait…" : mode === "login" ? "Log in" : mode === "signup" ? "Create my account" : "Verify & continue"}
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
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      )}
    </AuthCard>
  );
}
