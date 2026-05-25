import { test, expect } from './fixtures/global'

test.describe('Admin E2E robustes (fixtures)', () => {
  test.beforeEach(async ({ resetMock }) => {
    await resetMock()
  })

  test('Toolbar mock, avatar, drag, undo/redo 100% mock', async ({ adminLogin }) => {
    // La fixture va direct sur admin
    const page = adminLogin
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page.locator('.admin-avatar')).toHaveAttribute('src', /fakeci\.png/)
    await expect(page.locator('.block-hero')).toContainText('Événements à venir')
    await expect(page.locator('.block-text-img')).toContainText('présentation')
    await expect(page.locator('.block-spacer')).toBeVisible()
    await expect(page.locator('.block-draggable-handle').first()).toBeVisible()
    // Drag
    const blocks = page.locator('.block-draggable')
    if (await blocks.count() >= 2) {
      await blocks.nth(0).dragTo(blocks.nth(1))
    }
    await blocks.nth(0).click()
    await expect(page.locator('.sidebar-autoeditor')).toBeVisible()
    await page.keyboard.press('Control+Z')
    await page.keyboard.press('Control+Shift+Z')
  })
})
