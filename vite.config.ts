
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase the warning limit slightly since we are splitting chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split UI libraries (Framer Motion is heavy)
          'vendor-ui': ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'],
          // Split Supabase
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    }
  }
});
