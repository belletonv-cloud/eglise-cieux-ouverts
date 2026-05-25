import { test, expect } from './fixtures/admin-fixtures'

test.describe('Admin mode avec mocks CI', () => {
  test('Tout l’admin fonctionne avec les mocks (Cloudflare)', async ({ page }) => {
    // Force mode admin sur la page de test
    await page.goto('/event-list?admin=true')

    // Toolbar admin visible (mode mock)
    await expect(page.locator('.admin-toolbar')).toBeVisible()

    // L’avatar fake doit s’afficher
    await expect(page.locator('.admin-avatar')).toHaveAttribute('src', /fakeci\.png/)

    // Les blocs mock sont réellement présents
    await expect(page.locator('.block-hero')).toContainText('Événements à venir')
    await expect(page.locator('.block-text-img')).toContainText('présentation')
    await expect(page.locator('.block-spacer')).toBeVisible()

    // Drag handle doit exister (adapter la classe selon votre drag UI)
    const handles = page.locator('.block-draggable-handle')
    await expect(handles.first()).toBeVisible()

    // Simuler un drag-and-drop entre deux blocs
    const blocks = page.locator('.block-draggable')
    if (await blocks.count() >= 2) {
      await blocks.nth(0).dragTo(blocks.nth(1))
    }

    // Cliquer sur un bloc pour ouvrir la sidebar AutoEditor
    await blocks.nth(0).click()
    await expect(page.locator('.sidebar-autoeditor')).toBeVisible()

    // Simuler undo après une action
    await page.keyboard.press('Control+Z')
    // ...assertions à adapter à votre UI de feedback

    // Simuler redo (Ctrl+Shift+Z)
    await page.keyboard.press('Control+Shift+Z')
    // ...assertions complémentaires éventuelles
  })
})
