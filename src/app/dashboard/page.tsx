"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; name: string; email: string; role: "user" | "admin"; track: string };

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.replace("/login"); // not logged in
      const { data: profile } = await supabase
        .from("profiles")
        .select("id,name,email,role,track")
        .eq("id", data.session.user.id)
        .single();
      if (!profile) return router.replace("/login");
      setMe(profile as Profile);
    })();
  }, [router]);

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
  }

  if (!me) return <main className="p-8 text-slate-500">Loading…</main>;

  const first = (me.name || me.email).split(" ")[0];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900" data-testid="dashboard-greeting">
          Hello, {first} 👋
        </h1>
        <button
          onClick={logout}
          data-testid="logout-button"
          className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Log out
        </button>
      </header>
      <p className="mt-2 text-slate-600" data-testid="dashboard-role">
        You are logged in as {me.role === "admin" ? "an admin" : "a trainee"}. Track: {me.track}.
      </p>
      <p className="mt-6 border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        The full dashboard comes in the next step.
      </p>
    </main>
  );
}
