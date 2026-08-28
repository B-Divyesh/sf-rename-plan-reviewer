import { defineConfig, devices } from '@playwright/test';

const liveBaseUrl = process.env.RPR_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  // Service-worker state is scoped to each browser context. Keeping one
  // Chromium worker makes the 390px offline path reproducible on constrained
  // runners instead of racing two browser processes for the same preview.
  workers: 1,
  timeout: 30_000,
  use: { baseURL: liveBaseUrl ?? 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  // Never silently exercise a stale dist directory. `npm test` builds before
  // Playwright starts this preview; live verification opts in with RPR_BASE_URL.
  webServer: liveBaseUrl ? undefined : { command: 'npm run preview -- --host 127.0.0.1', port: 4173, reuseExistingServer: false },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-390-chromium', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } }
  ]
});
