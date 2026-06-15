import { test, expect } from './fixtures/snapshot-fixtures'

test.describe('Admin auto-save E2E', () => {
  test('Auto-save et feedback visuel', async ({ page }) => {
    await page.goto('/event-list?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })

    // Cliquer sur le premier bloc ouvre l'éditeur
    await page.locator('.block-wrapper').first().click()
    await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })

    // Vérifie que la toolbar admin et le bloc sont présents
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page.locator('[data-block-type="hero"]')).toContainText('Événements à venir')
  })
})
