import { createClient } from '@supabase/supabase-js';
const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
export const isConfigured = Boolean(url && key);
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder-anon-key', { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
