import { test as base } from '@playwright/test'

export const test = base.extend({
  adminLogin: async ({ page }, use) => {
    // Force fenêtre admin mockée
    await page.goto('/event-list?admin=true')
    await use(page)
  },
  resetMock: async ({ request }, use) => {
    await request.post('/api/reset-mock')
    await use(request)
  },
})
