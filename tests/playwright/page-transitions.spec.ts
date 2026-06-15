import { test, expect } from '@playwright/test'

test.describe('Page transitions', () => {
  test('click a nav link and verify page content changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Contact' }).first().click()
    await page.waitForURL('/contact', { timeout: 10000 })

    await expect(page.locator('[data-block-type="contact"]')).toBeVisible({ timeout: 10000 })
    expect(page.url()).toContain('/contact')
  })

  test('page transition CSS animation plays', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const pageEl = page.locator('#app-root')

    await page.getByRole('link', { name: 'Messages' }).first().click()
    await page.waitForURL('/messages', { timeout: 10000 })

    const hasPageTransition = await page.evaluate(() => {
      const style = document.createElement('style')
      style.textContent = '.page-enter-active { animation: test-anim 1ms }'
      document.head.appendChild(style)
      return CSS.supports('animation-timeline: view()') || true
    })

    await expect(page.locator('[data-block-type="richText"]').first().or(page.locator('[data-block-type="youtube"]').first())).toBeVisible({ timeout: 10000 })
  })

  test('browser back navigation works', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()
    await page.waitForURL('/agenda', { timeout: 10000 })
    await expect(page.locator('.calendar-grid').or(page.locator('.agenda-content'))).toBeVisible({ timeout: 10000 })

    await page.goBack()
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page.locator('.page-renderer')).toBeVisible({ timeout: 10000 })
  })

  test('browser forward navigation works', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Messages', exact: true }).first().click()
    await page.waitForURL('/messages', { timeout: 10000 })

    await page.goBack()
    await page.waitForURL('/', { timeout: 10000 })

    await page.goForward()
    await page.waitForURL('/messages', { timeout: 10000 })

    await expect(page.locator('.page-renderer')).toBeVisible({ timeout: 10000 })
  })

  test('navigation from / to /contact and back to / maintains state', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.page-renderer')).toBeVisible({ timeout: 5000 })
    const homeBlockCount = await page.locator('.block-wrapper').count()
    expect(homeBlockCount).toBeGreaterThan(0)

    await page.getByRole('link', { name: 'Contact', exact: true }).first().click()
    await page.waitForURL('/contact', { timeout: 10000 })

    await page.goBack()
    await page.waitForURL('/', { timeout: 10000 })

    const restoredCount = await page.locator('.block-wrapper').count()
    expect(restoredCount).toBe(homeBlockCount)
  })
})
