// Demo mode: set NEXT_PUBLIC_DEMO_MODE=true on the public demo site (a separate Supabase project).
// The demo accounts are shared and public on purpose, so never use real data there.
export const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const DEMO_TRAINEE = {
  email: process.env.NEXT_PUBLIC_DEMO_TRAINEE_EMAIL ?? "demo.trainee@ktacademy.demo",
  password: process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "DemoKT2026!",
};
export const DEMO_ADMIN = {
  email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "demo.admin@ktacademy.demo",
  password: process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "DemoKT2026!",
};

// Optional label for a shared test site, for example NEXT_PUBLIC_ENV_LABEL=QA.
// It shows a colored bar so nobody mistakes the test site for the real one. Empty means no bar.
export const ENV_LABEL = process.env.NEXT_PUBLIC_ENV_LABEL ?? "";
