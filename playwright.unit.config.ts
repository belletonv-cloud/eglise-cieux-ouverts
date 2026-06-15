import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/unit/**/*.spec.ts', '**/schema-driven/**/*.spec.ts'],
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  webServer: {
    command: 'PW_TEST=1 NITRO_PORT=3001 NITRO_HOST=0.0.0.0 node .output/server/index.mjs',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 300000,
  },
})
