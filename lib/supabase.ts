import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables
const getEnvVar = (key: string) => {
  try {
    // Check for Vite/ESM environment
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // Check for Node/Webpack environment
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    console.warn(`Error accessing env var ${key}`, e);
  }
  return '';
};

// Initialize Supabase client with your correct project URL and key
const supabaseUrl = 'https://mnjtumdncnfrixfhmfwe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uanR1bWRuY25mcml4ZmhtZndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjY0MDcsImV4cCI6MjA4NDMwMjQwN30.nf5brFimakPhZsY5VS548_mDK9FGei_W8PU6QScgBiA';

// Check if configured (for setup screen)
export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web'
    }
  }
});