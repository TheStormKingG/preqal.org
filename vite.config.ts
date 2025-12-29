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
              if (id.includes('node_modules')) {
                // CRITICAL: React and react-dom MUST be in the same chunk and load first
                // Only include core React packages here
                if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-is/')) {
                  return 'react-vendor';
                }
                // React Router and React Helmet can be in a separate chunk (they depend on React)
                if (id.includes('react-router') || id.includes('react-helmet')) {
                  return 'react-router-vendor';
                }
                // React-dependent UI libraries (must load after React)
                if (id.includes('lucide-react') || id.includes('react-international-phone')) {
                  return 'react-ui-vendor';
                }
                // Recharts is lazy-loaded, so it will be in a separate chunk automatically
                if (id.includes('recharts')) {
                  return 'charts-vendor';
                }
                // Other vendor libraries (non-React)
                return 'vendor';
              }
            }
          }
        }
      }
    };
});
