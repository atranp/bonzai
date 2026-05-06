import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { envServer } from "@/lib/env.server";

export function createSupabaseService() {
  return createClient(env.SUPABASE_URL, envServer.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

