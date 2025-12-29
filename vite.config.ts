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
        },
        // Ensure single React instance across all dependencies
        dedupe: ['react', 'react-dom', 'react-is'],
      },
      build: {
        minify: 'esbuild',
        cssMinify: true,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Only manually chunk truly large libraries
              // Let Vite/Rollup handle React and React ecosystem automatically
              if (id.includes('node_modules/recharts')) {
                return 'charts';
              }
              // Otherwise let Rollup decide chunking automatically
            }
          }
        }
      }
    };
});
