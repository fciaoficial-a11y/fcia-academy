import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const SUPABASE_URL = url ?? "";
export const SUPABASE_PUBLISHABLE_KEY = key ?? "";
export const SUPABASE_PROJECT_REF =
  (import.meta.env.VITE_SUPABASE_PROJECT_REF as string | undefined) ?? "";

export const isSupabaseConfigured = Boolean(url && key);

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env do projeto.",
    );
  }
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: `sb-${SUPABASE_PROJECT_REF}-auth-token`,
      },
    });
  }
  return _client;
}

export const supabase = isSupabaseConfigured ? getSupabase() : (null as unknown as SupabaseClient);