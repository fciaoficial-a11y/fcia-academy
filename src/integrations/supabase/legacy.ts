// Back-compat shim for legacy imports. The auto-generated client.ts only
// exports `supabase`; older modules expect helpers that no longer exist.
import { supabase } from "./client";

export { supabase };

export const isSupabaseConfigured =
  !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

export const getSupabase = () => supabase;

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";

export const SUPABASE_PROJECT_REF =
  (import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined) ?? "";

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "";