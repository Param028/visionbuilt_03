
import { createClient } from '@supabase/supabase-js';

// Safe environment variable retrieval
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  return '';
};

// Retrieve URL and Key
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY');

console.log('Supabase config check:');
console.log('supabaseUrl:', supabaseUrl ? 'Found' : 'Missing');
console.log('supabaseAnonKey:', supabaseAnonKey ? 'Found' : 'Missing');

// Check if configured
export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

console.log('isConfigured:', isConfigured);

// Initialize Supabase Client
// We use placeholders if config is missing to prevent runtime crash "supabaseUrl is required"
// The App component will handle the !isConfigured state by showing a setup screen.
const validUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = isConfigured ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(validUrl, validKey);
