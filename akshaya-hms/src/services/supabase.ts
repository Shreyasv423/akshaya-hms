import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
/** Override with an explicit proxy URL (e.g. a Cloudflare Worker) via .env */
const supabaseProxy = import.meta.env.VITE_SUPABASE_PROXY;

/*
 * 🇮🇳 INDIA FIX: supabase.co is blocked on most Indian ISPs.
 *
 * Dev  → Vite's built-in proxy serves /api/supabase/* → real Supabase.
 *          (configured in vite.config.ts)
 * Prod → Vercel rewrites /api/supabase/* → real Supabase.
 *          (configured in vercel.json)
 *
 * VITE_SUPABASE_PROXY lets you override with any other reverse-proxy URL.
 */
const isProd = import.meta.env.PROD;

const finalUrl = supabaseProxy
  ? supabaseProxy                          // explicit override always wins
  : isProd
    ? (typeof window !== "undefined" ? window.location.origin : supabaseUrl)
    : (typeof window !== "undefined" ? `${window.location.origin}/api/supabase` : supabaseUrl);

export const supabase = createClient(finalUrl, supabaseAnonKey);

