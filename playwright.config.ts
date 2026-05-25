import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  // Increase default test timeout to allow Nuxt preview and slower CI machines
  timeout: 120000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --port=3001',
    port: 3001,
    reuseExistingServer: !process.env.CI,
  },
})
