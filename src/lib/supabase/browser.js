import { createBrowserClient } from "@supabase/ssr";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicEnv()) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
