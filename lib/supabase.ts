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

// Initialize Supabase client with hardcoded values (temporary fix)
const supabaseUrl = 'https://yseofammdgqyrlqnanvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZW9mYW1tZGdxeXJscW5hbnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NTEyNzQsImV4cCI6MjA4NDAyNzI3NH0.yAwb-8Ud7I3x1OzXbm_BdUBAMJabNS7MVQeHe7XU1vg';

// Check if configured (for setup screen)
export const isConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';

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