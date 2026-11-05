import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**'],
  timeout: 30_000,
  retries: 1,
  workers: 2,

  use: {
    baseURL: 'https://preqal.org',
    // Don't record traces locally — only on CI failure
    trace: 'on-first-retry',
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    // Ignore the IP-redirect check that only fires on non-canonical domains
    ignoreHTTPSErrors: false,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Reporter: concise in CI, verbose locally
  reporter: process.env.CI ? 'github' : 'list',

  /* Every spec but smoke.spec.ts drives http://localhost:3000 by absolute URL,
     so those need a dev server; smoke reads the live site through baseURL and
     must NOT start one. The flag keeps the two apart: the e2e workflow sets it,
     the post-deploy smoke job does not, and neither can silently acquire the
     other's target. In CI the server is always started fresh — reusing one that
     already answers on 3000 would test whatever that server happens to be. */
  webServer: process.env.E2E_LOCAL
    ? {
        command: 'npm run dev',
        url: 'http://localhost:3000/',
        reuseExistingServer: !process.env.CI,
        /* Vite is normally ready in seconds, but this is the one step whose
           failure makes every test fail at once, and a cold or loaded runner
           is exactly when it is slowest — observed at 100s on a machine under
           load. Generous here costs nothing when the server is quick. */
        timeout: 240_000,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : undefined,
});
