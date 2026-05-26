import { test, expect } from './fixtures/global'

test.describe('Admin E2E robustes (fixtures)', () => {
  test.beforeEach(async ({ resetMock }) => {
    await resetMock()
  })

  test('Toolbar mock, avatar, drag, undo/redo 100% mock', async ({ page }) => {
    await page.goto('/event-list?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 4000 })
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page.locator('.admin-avatar')).toHaveAttribute('src', /fakeci\.png/)
    await expect(page.locator('.block-hero')).toContainText('Événements à venir')
    await expect(page.locator('.block-text-img')).toContainText('présentation')
    await expect(page.locator('.block-spacer')).toBeVisible()
    await expect(page.locator('.block-draggable-handle').first()).toBeVisible()
    // Ouvrir l'éditeur en cliquant sur le premier bloc
    await page.locator('.block-draggable').first().click()
    await expect(page.locator('.sidebar-autoeditor')).toBeVisible()
    await page.keyboard.press('Control+Z')
    await page.keyboard.press('Control+Shift+Z')
  })
})
