import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/playwright',
  testMatch: 'admin-mode.spec.ts',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3002',
    headless: true,
  },
})
