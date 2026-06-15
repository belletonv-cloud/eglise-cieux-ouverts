import { test, expect } from '@playwright/test'

test.describe('Error pages', () => {
  test('404 page for non-existent route', async ({ page }) => {
    await page.goto('/cette-page-n-existe-pas')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.error-page')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.error-code')).toContainText('404')
    await expect(page.locator('.error-title')).toContainText('Page introuvable')
    await expect(page.locator('.error-message')).toBeVisible()
  })

  test('error page has expected content structure', async ({ page }) => {
    await page.goto('/cette-page-n-existe-pas')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.error-code')).toBeVisible()
    await expect(page.locator('.error-title')).toBeVisible()
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-actions')).toBeVisible()
    await expect(page.locator('.error-suggestions')).toBeVisible()

    const links = page.locator('.error-actions a')
    expect(await links.count()).toBeGreaterThanOrEqual(1)
  })

  test('navigation back to home works from error page', async ({ page }) => {
    await page.goto('/cette-page-n-existe-pas')
    await page.waitForLoadState('networkidle')

    const homeLink = page.locator('.error-actions .btn-primary')
    await expect(homeLink).toBeVisible()
    await homeLink.click()

    await page.waitForURL('/', { timeout: 10000 })
    await expect(page.locator('.page-renderer')).toBeVisible({ timeout: 10000 })
  })

  test('error page has useful suggestion links', async ({ page }) => {
    await page.goto('/cette-page-n-existe-pas')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.error-suggestions')).toBeVisible()

    const suggestionLinks = page.locator('.error-links a')
    expect(await suggestionLinks.count()).toBeGreaterThanOrEqual(2)
  })

  test('error page SEO meta is correct', async ({ page }) => {
    await page.goto('/cette-page-n-existe-pas')
    await page.waitForLoadState('networkidle')

    const title = await page.title()
    expect(title).toContain('Page introuvable')
  })
})
