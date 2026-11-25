"use client";

import { useEffect } from "react";
import Logo from "./Logo";
import { clearAppCache } from "@/lib/session-cache";
import "@/styles/dark.css";

type Variant = "login" | "signup" | "forgot";

const HERO: Record<Variant, { head: React.ReactNode; text: string; chips: string[]; float: string; steps?: string[] }> = {
  login: {
    head: <>Master Katalon,<br /><em>one test at a time.</em></>,
    text: "Hands-on KT guides for Local Studio and TestOps, made for Katalon Mynt manual testers on their way to automation.",
    chips: ["📘 KT guides on demand", "🧪 Local + TestOps", "📈 Track progress"],
    float: "☁ TestOps Run #128 · ✓ 24 passed",
  },
  signup: {
    head: <>Start your Katalon<br /><em>journey today.</em></>,
    text: "Create your free account in under a minute. Get every KT guide, your own progress tracker and a place to keep your certificates.",
    chips: ["🏅 Save your certificates", "📚 Learn anytime", "📈 Track progress"],
    float: "🎓 Learn at your own pace",
    steps: ["Create your account", "Choose your learning track", "Learn, practice and earn certificates"],
  },
  forgot: {
    head: <>No worries,<br /><em>we&rsquo;ll get you back in.</em></>,
    text: "Hands-on KT guides for Local Studio and TestOps, made for Katalon Mynt manual testers on their way to automation.",
    chips: ["📘 KT guides on demand", "🧪 Local + TestOps", "📈 Track progress"],
    float: "☁ TestOps Run #128 · ✓ 24 passed",
  },
};

// Shared split layout (hero on the left, form card on the right) for login, sign-up, forgot and reset.
// Same markup and classes as the standalone site, so the arrangement matches exactly.
export default function AuthCard({ title, subtitle, children, onSubmit, variant = "login" }: { title?: string; subtitle: string; children: React.ReactNode; onSubmit: (e: React.FormEvent) => void; variant?: Variant }) {
  useEffect(() => {
    // The login pages always use the original light look. The saved choice is kept for after login.
    const root = document.documentElement;
    root.dataset.theme = "light";
    root.dataset.nav = "";
    window.dispatchEvent(new Event("kt-theme"));
    clearAppCache(); // nobody is signed in here, so nothing from an earlier visit may be reused
  }, []);
  const h = HERO[variant];
  const alt = variant === "signup";
  return (
    <div className={`lgn${alt ? " alt" : ""}`} data-testid="auth-page">
      <section className={`hero${alt ? " v2" : ""}`} data-testid="auth-hero">
        <div><Logo size={46} light /></div>
        <div>
          <h2 data-testid="authcard-h2-1">{h.head}</h2>
          <p style={{ marginTop: 14, opacity: 0.85, maxWidth: 460 }}>{h.text}</p>
        </div>
        {h.steps ? (
          <div className="glass run">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>How it works</div>
            {h.steps.map((t, i) => (
              <div key={t} className="r"><i className="n">{i + 1}</i>{t}</div>
            ))}
          </div>
        ) : (
          <div className="glass run">
            <div className="row" style={{ justifyContent: "space-between", fontWeight: 700, marginBottom: 6 }}>
              <span>▶ Login Flow · Test Suite</span>
              <span className="tag t">PASSED</span>
            </div>
            {["Open application", "Enter credentials", "Verify dashboard"].map((t) => (
              <div key={t} className="r"><i className="ck">✓</i>{t}</div>
            ))}
            <div className="bar" style={{ marginTop: 8, background: "rgba(255,255,255,.2)" }}><i style={{ width: "100%" }} /></div>
          </div>
        )}
        <div className="row" style={{ gap: 20, fontSize: 13, opacity: 0.9 }}>
          {h.chips.map((c) => <span key={c}>{c}</span>)}
        </div>
        <div className="glass fl" style={{ right: "6%", top: "11%", fontSize: 13, fontWeight: 600 }} data-testid="auth-hero-badge">{h.float}</div>
      </section>

      <section data-testid="authcard-section-1" className="fm">
        <form onSubmit={onSubmit} className="fc card" data-testid="auth-form" style={{ display: "grid", gap: 16 }}>
          <div>
            <h1 data-testid="authcard-h1-1" style={{ margin: 0, fontSize: 24 }}>{title ?? <>Welcome back <span aria-hidden="true">👋</span></>}</h1>
            <p className="mu" style={{ margin: "4px 0 0" }}>{subtitle}</p>
          </div>
          {children}
          <div className="mu" style={{ textAlign: "center", fontSize: 12.5 }}>🔒 Secure sign-in</div>
        </form>
      </section>
    </div>
  );
}

export const authInput =
  "w-full rounded-none border border-[var(--br)] bg-[var(--bg)] px-3 py-2.5 text-[var(--tx)] outline-none focus:border-[var(--pr)]";
export const authButton =
  "w-full bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-300/50 disabled:opacity-60";
