"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ALL_TRIBES } from "@/lib/tribes";
import { createClient } from "@/lib/supabase/client";
import { currentTheme, savedTheme, setTheme, type Theme } from "@/lib/theme";
import OnboardingModal from "./OnboardingModal";
import Logo from "./Logo";
import { hideLoading, showLoading } from "@/lib/overlay";
import "@/styles/dark.css";

const traineeLinks = [
  { href: "/dashboard", label: "Dashboard", short: "Home", id: "nav-dashboard", icon: "dashboard" },
  { href: "/certifications", label: "Certifications", short: "Certs", id: "nav-certs", icon: "certs" },
  { href: "/learn", label: "Learning & Tools", short: "Learn", id: "nav-learn", icon: "learn" },
  { href: "/profile", label: "Profile", short: "Profile", id: "nav-profile", icon: "profile" },
];
const adminLinks = [
  { href: "/admin", label: "Admin Dashboard", short: "Admin", id: "nav-admin-dashboard", icon: "admin" },
  { href: "/admin/trainees", label: "Trainees", short: "Trainees", id: "nav-admin-trainees", icon: "people" },
  { href: "/admin/submissions", label: "Submissions", short: "Review", id: "nav-admin-submissions", icon: "subs" },
  { href: "/learn", label: "Learning & Tools", short: "Learn", id: "nav-learn", icon: "learn" },
  { href: "/profile", label: "Profile", short: "Profile", id: "nav-profile", icon: "profile" },
];

// Line icons (same set as the first version of the site).
const ICONS: Record<string, React.ReactNode> = {
  dashboard: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  certs: <><circle cx="12" cy="9" r="6" /><path d="M8.5 14 7 22l5-3 5 3-1.5-8" /></>,
  learn: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
  admin: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  people: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.4c2 .8 3.5 2.6 3.5 5.6" /></>,
  subs: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  col: <><path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" /></>,
  out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
};
const Icon = ({ n }: { n: string }) => <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[n]}</svg>;

const initials = (n: string) => (n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("") || "?").toUpperCase();

type Mini = { id: string; name?: string; role: string; track: string; info: Record<string, unknown> | null };

export default function AppHeader({ active }: { active: string }) {
  const router = useRouter();
  const path = usePathname();
  const [theme, setT] = useState<Theme>("light");
  const [role, setRole] = useState<string | null>(null);
  const [who, setWho] = useState<{ name: string; avatar: string } | null>(null);
  const [min, setMin] = useState(false);
  const [pending, setPending] = useState(0);
  const [onb, setOnb] = useState<Mini | null>(null);

  // Apply the saved theme on every page and keep the toggle in step with the Profile page.
  useEffect(() => {
    setTheme(savedTheme());
    const sync = () => setT(currentTheme());
    window.addEventListener("kt-theme", sync);
    sync();
    return () => window.removeEventListener("kt-theme", sync);
  }, []);

  // Menu collapsed or open (remembered); small laptops start collapsed.
  useEffect(() => {
    let v: string | null = null;
    try { v = localStorage.getItem("kt2_nav"); } catch {}
    setMin(v === null ? window.innerWidth < 1100 : v === "1");
  }, []);

  // Mirror the menu state on <html> so the page padding always follows the menu.
  useEffect(() => {
    delete document.documentElement.dataset.navOut;
    document.documentElement.dataset.nav = min ? "min" : "full";
    return () => { delete document.documentElement.dataset.nav; };
  }, [min]);
  function toggleNav() {
    const m = !min;
    setMin(m);
    try { localStorage.setItem("kt2_nav", m ? "1" : "0"); } catch {}
  }

  // Finds out who is logged in: admins get the admin menu, new trainees get the onboarding question.
  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: s } = await sb.auth.getSession();
      if (!s.session) { hideLoading(); return; }
      const { data } = await sb.from("profiles").select("id,name,role,track,info").eq("id", s.session.user.id).single();
      const m = data as Mini | null;
      if (!m) { hideLoading(); return; }
      setRole(m.role);
      hideLoading(); // the signing-in screen ends when the app is ready
      setWho({ name: m.name ?? "", avatar: typeof m.info?.avatar === "string" ? (m.info.avatar as string) : "" });
      if (m.role === "admin") {
        const r = await sb.from("submissions").select("id", { count: "exact", head: true }).eq("status", "submitted");
        setPending(r.count ?? 0);
      }
      if (m.role === "admin" && path === "/dashboard") router.replace("/admin");
      if (m.role === "user" && !(m.info && m.info.team)) {
        // The tribe chosen on the sign-up form is applied here, after the first login.
        let pt: string | null = null;
        try { pt = localStorage.getItem("kt-pending-tribe"); } catch {}
        if (pt && ALL_TRIBES.includes(pt)) {
          try { localStorage.removeItem("kt-pending-tribe"); } catch {}
          await sb.from("profiles").update({ info: { ...(m.info ?? {}), team: pt } }).eq("id", m.id);
          window.location.reload();
          return;
        }
        setOnb(m);
      }
    })();
  }, [path, router]);

  async function logout() {
    // hide the menu right away (by a flag on <html>, so a kept-alive page can never stay hidden)
    document.documentElement.dataset.navOut = "1";
    document.documentElement.dataset.nav = "";
    showLoading("Signing you out…", "See you soon");
    router.prefetch("/login");
    await createClient().auth.signOut({ scope: "local" }); // clears this browser at once, no waiting for the server
    router.replace("/login");
  }

  const links = role === "admin" ? adminLinks : role ? traineeLinks : [];

  const name = who?.name || "";
  const av = (size: number, cls = "") => (
    <span className={`kt-av ${cls}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}>
      {who?.avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={who.avatar} alt="" /> : initials(name || "?")}
    </span>
  );
  const themeBtn = (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      data-testid="theme-toggle"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
      className="kt-nbtn"
    >
      <span className="kt-ni"><span aria-hidden="true">{theme === "dark" ? "☀" : "🌙"}</span></span>
      <span className="kt-nt">{theme === "dark" ? "Light theme" : "Dark theme"}</span>
    </button>
  );


  return (
    <>
      <div className="kt-mtop" data-testid="app-topbar">
        <Link href={role === "admin" ? "/admin" : "/dashboard"} aria-label="KT Academy home" className="shrink-0"><Logo size={30} tagline={false} /></Link>
        <span className="grow" />
        {who && av(34)}
        <button onClick={logout} data-testid="logout-button-mobile" className="kt-btn-g">Log out</button>
      </div>
      <aside id="kt-nav" className="kt-nav" data-min={min ? "1" : "0"} data-testid="app-header">
        <Link href={role === "admin" ? "/admin" : "/dashboard"} className="kt-nlogo" aria-label="KT Academy home" data-testid="header-logo">
          <Logo size={34} tagline={!min} />
        </Link>
        <div className="kt-nprof">
          {who && av(min ? 40 : 64, "kt-av-ring")}
          <b className="kt-nt" data-testid="nav-user-name">{name}</b>
          {role && <span className={`kt-tag kt-nt ${role === "admin" ? "a" : ""}`} data-testid="nav-user-role">{role === "admin" ? "Admin" : "Trainee"}</span>}
        </div>
        <div className="kt-nsec kt-nt">MENU</div>
        <nav className="kt-links" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} data-testid={l.id} title={l.label} aria-label={l.label} className={`kt-nl ${active === l.href ? "on" : ""}`}>
              <span className="kt-ni"><Icon n={l.icon} /></span>
              <span className="kt-nt">{l.label}</span>
              <span className="kt-ns">{l.short}</span>
              {l.href === "/admin/submissions" && pending > 0 && <span className="kt-nbd" data-testid="nav-admin-submissions-badge">{pending}</span>}
            </Link>
          ))}
        </nav>
        <div className="grow" />
        {themeBtn}
        <button onClick={toggleNav} className="kt-nbtn" title="Collapse or expand menu" aria-label="Collapse or expand menu" data-testid="nav-collapse-button">
          <span className="kt-ni kt-nci"><Icon n="col" /></span><span className="kt-nt">Collapse</span>
        </button>
        <button onClick={logout} className="kt-nbtn kt-nout" data-testid="logout-button" title="Log out" aria-label="Log out">
          <span className="kt-ni"><Icon n="out" /></span><span className="kt-nt">Log out</span>
        </button>
      </aside>
      {onb && <OnboardingModal me={onb} onClose={() => setOnb(null)} />}
    </>
  );
}
