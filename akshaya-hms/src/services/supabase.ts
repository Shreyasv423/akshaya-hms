import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseProxy = import.meta.env.VITE_SUPABASE_PROXY;

/* 
 * 🇮🇳 INDIA FIX: Supabase is blocked in India.
 * We use Vercel Rewrites (configured in vercel.json) to proxy reqs.
 * This makes the browser call Vercel instead of the blocked .co domain.
 */
const isProd = import.meta.env.PROD;
const finalUrl = isProd ? window.location.origin : (supabaseProxy || supabaseUrl);

export const supabase = createClient(
  finalUrl,
  supabaseAnonKey
);
