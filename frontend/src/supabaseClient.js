import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
  console.error("[Supabase] VITE_SUPABASE_URL missing — check Vercel env vars");
}
if (!supabaseAnonKey || supabaseAnonKey.includes("placeholder")) {
  console.error("[Supabase] VITE_SUPABASE_ANON_KEY missing — check Vercel env vars");
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder_key",
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);