import { defineConfig, devices } from '@playwright/test'

const isProd = process.env.E2E_MODE === 'prod'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: isProd ? 'pnpm build && pnpm start' : 'pnpm dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    // reuseExistingServer: !process.env.CI && !isProd,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 20 * 1000,
  },
})
