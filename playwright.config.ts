import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/playwright',
  // Increase default test timeout to allow Nuxt preview and slower CI machines
  timeout: 120000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  webServer: {
    command: 'PW_TEST=1 NITRO_PORT=3001 NITRO_HOST=0.0.0.0 npx nuxi preview',
    port: 3001,
    reuseExistingServer: true,
    timeout: 300000,
  },
})
