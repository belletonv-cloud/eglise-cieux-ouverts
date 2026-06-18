import { test, expect } from './fixtures/global'

test.describe('/admin page — authenticated (mock user)', () => {
  test('visiting /admin auto-redirects to /?admin=true', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL(/\/\?admin=true/, { timeout: 10000 })
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page.locator('#app-root')).toHaveClass(/admin-mode/)
  })

  test('visiting /admin?redirect=/agenda?admin=true redirects to agenda', async ({ page }) => {
    const redirectParam = encodeURIComponent('/agenda?admin=true')
    await page.goto(`/admin?redirect=${redirectParam}`)
    await page.waitForURL(/\/agenda\?admin=true/, { timeout: 10000 })
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    const select = page.locator('.admin-page-select')
    await expect(select).toHaveValue('agenda')
  })

  test('visiting /admin?redirect=/contact?admin=true redirects to contact', async ({ page }) => {
    const redirectParam = encodeURIComponent('/contact?admin=true')
    await page.goto(`/admin?redirect=${redirectParam}`)
    await page.waitForURL(/\/contact\?admin=true/, { timeout: 10000 })
    await expect(page.locator('.admin-toolbar')).toBeVisible()
  })

  test('redirect target without ?admin=true does NOT activate admin mode', async ({ page }) => {
    // Visit /admin?redirect=/event-list (no ?admin=true in redirect target)
    const redirectParam = encodeURIComponent('/event-list')
    await page.goto(`/admin?redirect=${redirectParam}`)
    // The page auto-redirects to /event-list (as specified by the redirect param,
    // no ?admin=true is added since the redirect param controls the target)
    await page.waitForURL(/\/event-list/, { timeout: 10000 })
    // Admin mode should NOT be active since ?admin=true is absent
    const toolbar = page.locator('.admin-toolbar')
    await expect(toolbar).not.toBeVisible()
    await expect(page.locator('#app-root')).not.toHaveClass(/admin-mode/)
  })

  test('admin page renders spinner briefly before redirect', async ({ page }) => {
    // Navigate and capture the initial content before redirect
    const response = await page.goto('/admin', { waitUntil: 'commit' })
    expect(response?.status()).toBe(200)
    // The spinner should be in the SSR HTML
    const html = await page.content()
    expect(html).toContain('Vérification de l\'authentification')
  })
})

test.describe('/admin page — unauthenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as any).__MOCK_AUTH_RESULT = null
    })
  })

  test('login page renders with Google sign-in button', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForSelector('.admin-login-card', { timeout: 10000 })
    await expect(page.locator('.admin-login-card h1')).toHaveText('Administration')
    await expect(
      page.getByRole('button', { name: 'Se connecter avec Google' })
    ).toBeVisible()
  })

  test('/admin page has correct SEO meta tags', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForSelector('.admin-login-card', { timeout: 10000 })
    const title = await page.title()
    expect(title).toBe('Administration — Église Cieux Ouverts')
  })

  test('/admin preserves redirect param when unauthenticated', async ({ page }) => {
    const redirectParam = encodeURIComponent('/agenda?admin=true')
    await page.goto(`/admin?redirect=${redirectParam}`)
    await page.waitForSelector('.admin-login-card', { timeout: 10000 })
    // Page should NOT redirect since we're unauthenticated
    // The redirect param must remain in the URL for post-login redirect
    await expect(page).toHaveURL(/\/admin/)
    const params = new URL(page.url()).searchParams
    expect(params.get('redirect')).toBe('/agenda?admin=true')
  })

  test('/admin without redirect param shows default redirect hint', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForSelector('.admin-login-card', { timeout: 10000 })
    // No redirect param in URL
    const params = new URL(page.url()).searchParams
    expect(params.has('redirect')).toBe(false)
  })
})
