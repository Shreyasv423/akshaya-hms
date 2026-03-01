import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseProxy = import.meta.env.VITE_SUPABASE_PROXY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing!");
}

// If a proxy URL is provided (to bypass India's ban), use that instead of the blocked .co domain
export const supabase = createClient(
  supabaseProxy || supabaseUrl,
  supabaseAnonKey
);
