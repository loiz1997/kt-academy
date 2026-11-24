"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard", id: "nav-dashboard" },
  { href: "/certifications", label: "Certifications", id: "nav-certs" },
  { href: "/learn", label: "Learning", id: "nav-learn" },
  { href: "/profile", label: "Profile", id: "nav-profile" },
];

export default function AppHeader({ active }: { active: string }) {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
  }

  return (
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
          onClick={logout}
          data-testid="logout-button"
          className="shrink-0 border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
