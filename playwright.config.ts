import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
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
});
