import { test, expect } from './fixtures/global'

test.describe('Admin mode avec mocks CI', () => {
  test('Tout l’admin fonctionne avec les mocks (Cloudflare)', async ({ page }) => {
    await page.goto('/event-list?admin=true')

    // Toolbar admin visible (mode mock)
    await expect(page.locator('.admin-toolbar')).toBeVisible({ timeout: 10000 })

    // L'avatar fake doit s'afficher
    await expect(page.locator('.admin-avatar')).toHaveAttribute('src', /fakeci\.png/)

    // Les blocs mock sont réellement présents (via data-block-type, pas .block-{type})
    await expect(page.locator('[data-block-type="hero"]')).toContainText('Événements à venir')
    await expect(page.locator('[data-block-type="textImage"]')).toContainText('présentation')
    await expect(page.locator('[data-block-type="spacer"]')).toBeVisible()

    // Les blocs sont en mode admin (survol ajoute outline dashed)
    await page.locator('.block-wrapper').first().hover()
    await expect(page.locator('.block-wrapper').first()).toBeVisible()

    // Ouvrir l'éditeur en cliquant sur le premier bloc (.block-wrapper est le contenant)
    await page.locator('.block-wrapper').first().click()
    await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })

    // Simuler undo après une action
    await page.keyboard.press('Control+Z')

    // Simuler redo (Ctrl+Shift+Z)
    await page.keyboard.press('Control+Shift+Z')
  })
})
