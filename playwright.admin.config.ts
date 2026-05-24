import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/playwright',
  testMatch: 'admin-*.spec.ts',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3002',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
