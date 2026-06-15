import type { Page } from '@playwright/test'

/**
 * Navigue sur une page avec ?admin=true et attend la toolbar admin
 */
export async function loginAsAdmin(page: Page, route = '/'): Promise<void> {
  await page.goto(`${route}?admin=true`)
  await page.waitForSelector('.admin-toolbar', { timeout: 4000 })
}

/**
 * Vérifie la présence et la visibilité du badge "Mode édition"
 */
export async function expectAdminBadge(page: Page): Promise<void> {
  const badge = page.locator('.admin-badge')
  await badge.waitFor({ state: 'visible', timeout: 2000 })
  await badge.getByText('Mode édition').isVisible()
}
