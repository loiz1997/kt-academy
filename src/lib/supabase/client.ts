import { createBrowserClient } from "@supabase/ssr";

// One Supabase client for the browser. The URL and the public anon key come from .env.local.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
