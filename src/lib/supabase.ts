import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if variables are valid and not placeholders
const isValidCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("your-project-id") && 
  !supabaseAnonKey.includes("your-anon-key");

export const isSupabaseConfigured = !!isValidCredentials;

// Create Supabase client if configured, otherwise null
export const supabase = isValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isValidCredentials) {
  console.warn(
    "⚠️ Supabase is not configured yet. Please update .env.local with your Supabase URL and Anon Key. Storefront is running in offline mock data mode."
  );
}
