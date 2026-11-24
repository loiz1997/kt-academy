"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { currentTheme, savedTheme, setTheme, type Theme } from "@/lib/theme";
import OnboardingModal from "./OnboardingModal";
import "@/styles/dark.css";

const traineeLinks = [
  { href: "/dashboard", label: "Dashboard", id: "nav-dashboard" },
  { href: "/certifications", label: "Certifications", id: "nav-certs" },
  { href: "/learn", label: "Learning", id: "nav-learn" },
  { href: "/profile", label: "Profile", id: "nav-profile" },
];
const adminLinks = [
  { href: "/admin", label: "Dashboard", id: "nav-admin-dashboard" },
  { href: "/admin/submissions", label: "Submissions", id: "nav-admin-submissions" },
  { href: "/admin/trainees", label: "Trainees", id: "nav-admin-trainees" },
  { href: "/learn", label: "Learning", id: "nav-learn" },
  { href: "/profile", label: "Profile", id: "nav-profile" },
];

type Mini = { id: string; role: string; track: string; info: Record<string, unknown> | null };

export default function AppHeader({ active }: { active: string }) {
  const router = useRouter();
  const path = usePathname();
  const [theme, setT] = useState<Theme>("light");
  const [role, setRole] = useState<string | null>(null);
  const [onb, setOnb] = useState<Mini | null>(null);

  // Apply the saved theme on every page and keep the toggle in step with the Profile page.
  useEffect(() => {
    setTheme(savedTheme());
    const sync = () => setT(currentTheme());
    window.addEventListener("kt-theme", sync);
    sync();
    return () => window.removeEventListener("kt-theme", sync);
  }, []);

  // Finds out who is logged in: admins get the admin menu, new trainees get the onboarding question.
  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: s } = await sb.auth.getSession();
      if (!s.session) return;
      const { data } = await sb.from("profiles").select("id,role,track,info").eq("id", s.session.user.id).single();
      const m = data as Mini | null;
      if (!m) return;
      setRole(m.role);
      if (m.role === "admin" && path === "/dashboard") router.replace("/admin");
      if (m.role === "user" && !(m.info && m.info.team)) setOnb(m);
    })();
  }, [path, router]);

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
  }

  const links = role === "admin" ? adminLinks : role ? traineeLinks : [];

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur" data-testid="app-header">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <span className="text-lg font-extrabold text-slate-900">
            <span className="text-indigo-600">KT</span> Academy
          </span>
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-testid={l.id}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-semibold ${
                  active === l.href ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="theme-toggle"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
            className="grid h-9 w-9 shrink-0 place-items-center border border-slate-300 text-base"
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
          <button
            onClick={logout}
            data-testid="logout-button"
            className="shrink-0 border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
          >
            Log out
          </button>
        </div>
      </header>
      {onb && <OnboardingModal me={onb} onClose={() => setOnb(null)} />}
    </>
  );
}
