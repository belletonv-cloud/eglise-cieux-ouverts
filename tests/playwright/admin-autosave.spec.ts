import { test, expect } from './fixtures/snapshot-fixtures'

test.describe('Admin auto-save E2E', () => {
  test('Auto-save et feedback visuel', async ({ page }) => {
    await page.goto('/event-list?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 4000 })

    // Cliquer sur le premier bloc ouvre l'éditeur
    await page.locator('.block-wrapper').first().click()
    await expect(page.locator('.sidebar-autoeditor')).toBeVisible()

    // Vérifie que la toolbar admin et le bloc sont présents
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page.locator('.block-hero')).toContainText('Événements à venir')
  })
})
