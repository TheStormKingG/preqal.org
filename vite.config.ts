import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const vitePrerender = require('vite-plugin-prerender');
const { PuppeteerRenderer } = require('vite-plugin-prerender');

const PRERENDER_ROUTES = [
  '/',
  '/services',
  '/services/business-plan',
  '/services/risk-scan',
  '/services/systems-builder',
  '/services/certified-care',
  '/services/export-ready',
  '/resources',
  '/e-courses',
  '/contact',
  '/business-growth-assessment',
  '/preqal-not-prequel',
  '/privacy-policy',
  '/terms-of-service',
];

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        vitePrerender({
          staticDir: path.join(__dirname, 'dist'),
          routes: PRERENDER_ROUTES,
          renderer: new PuppeteerRenderer({
            headless: true,
            renderAfterTime: 2000,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
              || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          }),
        }),
      ],
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
