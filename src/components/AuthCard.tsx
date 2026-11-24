"use client";

import { useEffect } from "react";
import { savedTheme, setTheme } from "@/lib/theme";
import "@/styles/dark.css";

// Shared card for the login, sign-up, forgot and reset pages.
export default function AuthCard({ title, subtitle, children, onSubmit }: { title?: string; subtitle: string; children: React.ReactNode; onSubmit: (e: React.FormEvent) => void }) {
  useEffect(() => {
    setTheme(savedTheme()); // the login pages follow the saved light/dark choice too
  }, []);
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-teal-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border border-slate-200 bg-white p-7 shadow-xl" data-testid="auth-form">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {title ?? (<><span className="text-indigo-600">KT</span> Academy</>)}
          </h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </form>
    </main>
  );
}

export const authInput =
  "w-full rounded-none border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
export const authButton =
  "w-full bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-300/50 disabled:opacity-60";
