import { test, expect } from '@playwright/test'

test.describe('Basic accessibility checks', () => {
  test('lang="fr" on <html>', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const lang = await page.evaluate(() => document.documentElement.lang)
    expect(lang).toBe('fr')
  })

  test('headings follow a logical order', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const headingLevels = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      return Array.from(headings).map(h => parseInt(h.tagName[1]))
    })

    expect(headingLevels.length).toBeGreaterThan(0)

    for (let i = 1; i < headingLevels.length; i++) {
      const prev = headingLevels[i - 1]
      const curr = headingLevels[i]
      expect(curr - prev).toBeLessThanOrEqual(2)
    }
  })

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).not.toBeNull()
    }
  })

  test('interactive elements have accessible names', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const interactive = page.locator('a:visible, button:visible')
    const count = await interactive.count()
    const failed: number[] = []

    for (let i = 0; i < count; i++) {
      const el = interactive.nth(i)
      const name = await el.evaluate(node => {
        if (node instanceof HTMLElement || node instanceof SVGElement) {
          const accName = node.getAttribute('aria-label')
            || node.getAttribute('aria-labelledby')
            || node.getAttribute('title')
          if (accName) return accName

          const text = node.textContent?.trim()
          if (text && text.length > 0) return text

          const img = node.querySelector('img[alt]')
          if (img && img.getAttribute('alt')!.trim()) {
            return img.getAttribute('alt')
          }
        }
        return null
      })
      if (!name) failed.push(i)
    }

    expect(failed).toEqual([])
  })

  test('admin toolbar buttons have title attributes', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('.admin-icon-btn')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toHaveAttribute('title')
    }
  })

  test('basic color contrast on error page', async ({ page }) => {
    await page.goto('/cette-page-n-existe-pas')
    await page.waitForLoadState('networkidle')

    const errorBtn = page.locator('.btn-primary').first()
    await expect(errorBtn).toBeVisible()

    const bg = await errorBtn.evaluate(el => window.getComputedStyle(el).backgroundColor)
    const color = await errorBtn.evaluate(el => window.getComputedStyle(el).color)

    expect(bg).not.toBe(color)
  })

  test('no empty heading elements', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const count = await headings.count()

    for (let i = 0; i < count; i++) {
      const text = await headings.nth(i).textContent()
      expect(text).not.toBeNull()
      expect(text!.trim().length).toBeGreaterThan(0)
    }
  })

  test('no HTML validation issues (doctype, charset)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const charset = await page.evaluate(() => document.characterSet)
    expect(charset.toLowerCase()).toBe('utf-8')

    const hasDoctype = await page.evaluate(() => document.doctype !== null)
    expect(hasDoctype).toBe(true)
  })
})
