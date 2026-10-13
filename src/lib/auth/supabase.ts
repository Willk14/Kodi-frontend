import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";

let client: SupabaseClient | null = null;

/** Browser client using the PUBLIC anon key only. Never a service-role key. */
export function getSupabase(): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  client ??= createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
