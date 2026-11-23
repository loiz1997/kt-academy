"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

const input =
  "w-full rounded-none border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [track, setTrack] = useState("Both");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const p = mode === "login" ? "login" : "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email || !password) return setError("Enter your email and password.");
    if (mode === "signup") {
      if (!name.trim()) return setError("Enter your name.");
      if (password.length < 6) return setError("Use a password with 6 or more characters.");
    }
    setBusy(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError("Wrong email or password.");
      router.push("/dashboard");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim(), track } },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (!data.session) return setInfo("Check your email to confirm your account, then log in.");
      router.push("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-teal-100 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 border border-slate-200 bg-white p-7 shadow-xl"
        data-testid="auth-form"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            <span className="text-indigo-600">KT</span> Academy
          </h1>
          <p className="text-sm text-slate-500">
            {mode === "login" ? "Welcome back! Log in to keep learning." : "Create your account to start learning."}
          </p>
        </div>

        {mode === "signup" && (
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="signup-name-input"
              autoComplete="name"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className={input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid={`${p}-email-input`}
            autoComplete="email"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid={`${p}-password-input`}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {mode === "signup" && (
          <label className="block text-sm font-medium text-slate-700">
            Track
            <select
              className={input}
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              data-testid="signup-track-select"
            >
              <option>Both</option>
              <option>Local</option>
              <option>TestOps</option>
            </select>
          </label>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600" data-testid={`${p}-error-message`}>
            {error}
          </p>
        )}
        {info && (
          <p className="text-sm font-medium text-teal-700" data-testid="signup-info-message">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          data-testid={`${p}-submit-button`}
          className="w-full bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-300/50 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-600">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            className="font-semibold text-indigo-600 underline"
            data-testid={mode === "login" ? "login-go-to-signup-link" : "signup-go-to-login-link"}
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setInfo("");
            }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    </main>
  );
}
