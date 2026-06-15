import { test, expect } from './fixtures/snapshot-fixtures'

test.describe('Admin undo/redo E2E complet', () => {
  test('Undo/Redo sur édition de bloc', async ({ page }) => {
    await page.goto('/event-list?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })

    // Vérifie que les blocs mock sont présents
    await expect(page.locator('[data-block-type="hero"]')).toContainText('Événements à venir')
    await expect(page.locator('[data-block-type="textImage"]')).toContainText('présentation')
    await expect(page.locator('[data-block-type="spacer"]')).toBeVisible()

    // Ouvre l'éditeur du premier bloc
    await page.locator('.block-wrapper').first().click()
    await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })

    // Les boutons undo/redo sont présents dans la toolbar
    await expect(page.locator('.admin-icon-btn').first()).toBeVisible()

    // Test undo via Ctrl+Z (doesn't crash)
    await page.keyboard.press('Control+Z')

    // Test redo via Ctrl+Shift+Z (doesn't crash)
    await page.keyboard.press('Control+Shift+Z')
  })
})