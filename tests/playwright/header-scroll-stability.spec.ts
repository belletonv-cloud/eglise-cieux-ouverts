import { test, expect } from '@playwright/test'

test.describe('Header and menu stability on scroll', () => {
  test('desktop: header stays fixed while scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })

    const header = page.locator('.site-header')
    await expect(header).toBeVisible()

    const before = await header.evaluate((el) => {
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        top: Math.round(rect.top),
        position: style.position,
      }
    })

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6))
    await page.waitForTimeout(250)

    const after = await header.evaluate((el) => {
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        top: Math.round(rect.top),
        position: style.position,
      }
    })

    expect(before.position).toBe('fixed')
    expect(after.position).toBe('fixed')
    expect(before.top).toBe(0)
    expect(after.top).toBe(0)
  })

  test('admin: toolbar and header offsets remain correct while scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/?admin=true', { waitUntil: 'networkidle' })

    const toolbar = page.locator('.admin-toolbar')
    const header = page.locator('.site-header')
    await expect(toolbar).toBeVisible()
    await expect(header).toBeVisible()

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.65))
    await page.waitForTimeout(300)

    const toolbarTop = await toolbar.evaluate((el) => Math.round(el.getBoundingClientRect().top))
    const headerTop = await header.evaluate((el) => Math.round(el.getBoundingClientRect().top))

    expect(toolbarTop).toBe(0)
    expect(headerTop).toBeGreaterThanOrEqual(48)
  })

  test('mobile: opening burger menu locks body scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/', { waitUntil: 'networkidle' })

    const burger = page.locator('.burger')
    await expect(burger).toBeVisible()
    await burger.click()

    await expect(page.locator('.site-header')).toHaveClass(/menu-open/)

    const overflow = await page.evaluate(() => document.body.style.overflow)
    expect(overflow).toBe('hidden')

    const nav = page.locator('.nav-mobile')
    await expect(nav).toBeVisible()
  })
})
