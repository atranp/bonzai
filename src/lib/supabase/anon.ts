import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createSupabaseAnon() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

