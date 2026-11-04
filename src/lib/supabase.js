import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes("YOUR_PROJECT"));
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

export async function loadPublishedApps() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("apps")
    .select("id,name,slug,short_name,tagline,description,category,price,price_label,version,status,is_new,is_popular,icon,gradient,features,show_on_homepage")
    .eq("status", "published")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function loadPublicContent(table, limit = 8) {
  if (!supabase) return [];
  const { data, error } = await supabase.from(table)
    .select("*").eq("status", "published")
    .order("display_order", { ascending: true }).limit(limit);
  if (error) throw error;
  return data ?? [];
}