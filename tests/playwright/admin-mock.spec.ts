import { test, expect } from './fixtures/global'

test.describe('Admin mode avec mocks CI', () => {
  test('Tout l’admin fonctionne avec les mocks (Cloudflare)', async ({ page }) => {
    await page.goto('/event-list?admin=true')

    // Toolbar admin visible (mode mock)
    await expect(page.locator('.admin-toolbar')).toBeVisible()

    // L’avatar fake doit s’afficher
    await expect(page.locator('.admin-avatar')).toHaveAttribute('src', /fakeci\.png/)

    // Les blocs mock sont réellement présents
    await expect(page.locator('.block-hero')).toContainText('Événements à venir')
    await expect(page.locator('.block-text-img')).toContainText('présentation')
    await expect(page.locator('.block-spacer')).toBeVisible()

    // Drag handle doit exister
    await expect(page.locator('.drag-handle').first()).toBeVisible()

    // Ouvrir l'éditeur en cliquant sur le premier bloc
    await page.locator('.block-draggable').first().click()
    await expect(page.locator('.sidebar-autoeditor')).toBeVisible()

    // Simuler undo après une action
    await page.keyboard.press('Control+Z')

    // Simuler redo (Ctrl+Shift+Z)
    await page.keyboard.press('Control+Shift+Z')
  })
})
