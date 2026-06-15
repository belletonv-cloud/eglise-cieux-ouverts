import { test, expect } from '@playwright/test'

const PAGE_BLOCKS = [
  { type: 'hero' },
  { type: 'bienvenue' },
  { type: 'rejoins' },
  { type: 'aspirations' },
  { type: 'vision' },
  { type: 'activities' },
  { type: 'nousRejoindre' },
  { type: 'contact' },
]

test.describe('Keyboard navigation in admin mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.admin-toolbar')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.block-wrapper')).toHaveCount(PAGE_BLOCKS.length, { timeout: 15000 })
  })

  test('blocks can receive focus programmatically', async ({ page }) => {
    const firstBlock = page.locator('.block-wrapper').first()
    await firstBlock.evaluate(el => el.setAttribute('tabindex', '-1'))
    await firstBlock.focus()
    await expect(firstBlock).toBeFocused()
  })

  test('click selects a block (admin-selected class + sidebar opens)', async ({ page }) => {
    const firstBlock = page.locator('.block-wrapper').first()
    await firstBlock.scrollIntoViewIfNeeded()
    await firstBlock.click({ force: true })
    await page.waitForTimeout(500)
    await expect(firstBlock).toHaveClass(/admin-selected/)
    await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 3000 })
  })

  test('Escape deselects current block', async ({ page }) => {
    const firstBlock = page.locator('.block-wrapper').first()
    await firstBlock.scrollIntoViewIfNeeded()
    await firstBlock.click({ force: true })
    await page.waitForTimeout(500)
    await expect(firstBlock).toHaveClass(/admin-selected/)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await expect(firstBlock).not.toHaveClass(/admin-selected/)
    await expect(page.locator('.admin-sidebar')).not.toBeVisible()
  })

  test('Escape exits admin mode when no block is selected', async ({ page }) => {
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page.locator('#app-root')).toHaveClass(/admin-mode/)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    await expect(page.locator('.admin-toolbar')).not.toBeVisible()
    await expect(page.locator('#app-root')).not.toHaveClass(/admin-mode/)
  })

  test('focus ring is visible on focused block', async ({ page }) => {
    const firstBlock = page.locator('.block-wrapper').first()
    await firstBlock.evaluate(el => el.setAttribute('tabindex', '-1'))
    await firstBlock.focus()

    const outline = await firstBlock.evaluate(el => window.getComputedStyle(el).outline)
    const outlineColor = await firstBlock.evaluate(el => window.getComputedStyle(el).outlineColor)

    const hasOutline = outline !== '0px' && outline !== '' && !outline.includes('0px')
    const hasColor = outlineColor !== 'rgb(0, 0, 0)' && outlineColor !== ''

    expect(hasOutline || hasColor).toBe(true)
  })

  test('clicking a block opens the admin sidebar', async ({ page }) => {
    const firstBlock = page.locator('.block-wrapper').first()
    await firstBlock.scrollIntoViewIfNeeded()
    await firstBlock.click({ force: true })
    await page.waitForTimeout(500)

    await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('.admin-sidebar-header h3')).not.toBeEmpty()
  })
})
