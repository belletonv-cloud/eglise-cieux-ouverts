import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/playwright',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  webServer: {
    command: 'npx wrangler pages dev dist --port 3001',
    port: 3001,
    timeout: 30000,
    reuseExistingServer: !process.env.CI,
  },
})
