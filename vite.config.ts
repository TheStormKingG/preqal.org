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
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Split vendor chunks for better caching
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                if (id.includes('recharts')) {
                  return 'charts-vendor';
                }
                if (id.includes('lucide-react')) {
                  return 'icons-vendor';
                }
                return 'vendor';
              }
            },
            // Optimize chunk size warnings
            chunkSizeWarningLimit: 600
          }
        }
      }
    };
});
