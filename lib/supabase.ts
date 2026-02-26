
import { createClient } from '@supabase/supabase-js';

// Safe environment variable retrieval
const getEnv = (key: string) => {
  let val = '';
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    val = import.meta.env[key];
  }
  // @ts-ignore
  else if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    val = process.env[key];
  }
  return val ? val.trim() : '';
};

// Retrieve URL and Key
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY');

// Check if configured
export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Initialize Supabase Client
// We use placeholders if config is missing to prevent runtime crash "supabaseUrl is required"
// The App component will handle the !isConfigured state by showing a setup screen.
const validUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = isConfigured ? supabaseAnonKey : 'placeholder';

// Debug logging for connection issues
if (typeof window !== 'undefined') {
    console.log(`[Supabase] Initializing client with URL: ${validUrl.replace(/^(https?:\/\/)([^.]+)(.*)$/, '$1***$3')}`);
    if (!isConfigured) {
        console.warn('[Supabase] Client not configured. Using placeholder URL.');
    }
}

export const supabase = createClient(validUrl, validKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        fetch: (url, options) => {
            return fetch(url, { ...options, signal: AbortSignal.timeout(15000) }); // 15s timeout
        }
    }
});
