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
    command: 'npx nuxt preview --port 3001',
    port: 3001,
    // Give Nuxt preview more time to start
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
})
