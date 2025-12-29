import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        minify: 'esbuild',
        cssMinify: true,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Split vendor chunks for better caching
              if (id.includes('node_modules')) {
                // Put all React-related packages in the same chunk to avoid loading order issues
                if (id.includes('react') || 
                    id.includes('react-dom') || 
                    id.includes('lucide-react') ||
                    id.includes('react-router') ||
                    id.includes('react-helmet') ||
                    id.includes('react-international-phone')) {
                  return 'react-vendor';
                }
                // Recharts can be separate (it has its own React dependency handling)
                if (id.includes('recharts')) {
                  return 'charts-vendor';
                }
                return 'vendor';
              }
            }
          }
        }
      }
    };
});
