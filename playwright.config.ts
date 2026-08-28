import { defineConfig, devices } from '@playwright/test';

const liveBaseUrl = process.env.RPR_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  timeout: 30_000,
  use: { baseURL: liveBaseUrl ?? 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: liveBaseUrl ? undefined : { command: 'npm run preview -- --host 127.0.0.1', port: 4173, reuseExistingServer: true },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-390-chromium', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } }
  ]
});
