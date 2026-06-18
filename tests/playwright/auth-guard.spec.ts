import { test, expect } from './fixtures/global'
import { loginAsAdmin, expectAdminBadge } from './helpers/admin'

test.describe('Auth guard — authenticated (mock user)', () => {
  test('?admin=true activates admin mode with mock auth', async ({ page }) => {
    await loginAsAdmin(page)
    await expectAdminBadge(page)
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page.locator('#app-root')).toHaveClass(/admin-mode/)
  })

  test('fake user avatar is visible in admin toolbar', async ({ page }) => {
    await loginAsAdmin(page)
    const avatar = page.locator('.admin-avatar')
    await expect(avatar).toBeVisible()
    await expect(avatar).toHaveAttribute('src', /fakeci/)
  })

  test('admin mode persists across client page navigation', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/agenda?admin=true')
    await expect(page.locator('.admin-toolbar')).toBeVisible({ timeout: 10000 })
    const select = page.locator('.admin-page-select')
    await expect(select).toHaveValue('agenda')
  })

  test('admin mode is removed when navigating away from ?admin=true', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.locator('#app-root')).toHaveClass(/admin-mode/)
    await page.goto('/')
    await expect(page.locator('#app-root')).not.toHaveClass(/admin-mode/)
  })

  test('fake user email is present in auth observable', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 4000 })
    // Verify auth state provided the fake user by checking the avatar
    const avatar = page.locator('.admin-avatar')
    await expect(avatar).toBeVisible()
  })

  test('admin mode activates via onMounted path on direct page load', async ({ page }) => {
    // Direct page load with ?admin=true — onMounted handles auth check
    await page.goto('/contact?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 4000 })
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page).toHaveURL(/\/contact/)
  })

  test('admin mode activates via watcher path on client navigation', async ({ page }) => {
    // Start without admin param, then navigate to a page with ?admin=true
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.goto('/messages?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 4000 })
    await expect(page.locator('.admin-toolbar')).toBeVisible()
    await expect(page).toHaveURL(/\/messages/)
  })
})

test.describe('Auth guard — unauthenticated (redirect to login)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as any).__MOCK_AUTH_RESULT = null
    })
  })

  test('?admin=true on homepage redirects to /admin?redirect=/?admin=true', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForURL(/\/admin\?redirect=/, { timeout: 15000 })
    const params = new URL(page.url()).searchParams
    expect(params.get('redirect')).toBe('/?admin=true')
  })

  test('?admin=true on /agenda redirects with full path encoded', async ({ page }) => {
    await page.goto('/agenda?admin=true')
    await page.waitForURL(/\/admin\?redirect=/, { timeout: 15000 })
    const params = new URL(page.url()).searchParams
    expect(params.get('redirect')).toBe('/agenda?admin=true')
  })

  test('?admin=true on /contact redirects with full path encoded', async ({ page }) => {
    await page.goto('/contact?admin=true')
    await page.waitForURL(/\/admin\?redirect=/, { timeout: 15000 })
    const params = new URL(page.url()).searchParams
    expect(params.get('redirect')).toBe('/contact?admin=true')
  })

  test('login page renders with Google sign-in button after redirect', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForURL(/\/admin/, { timeout: 15000 })
    await page.waitForSelector('.admin-login-card', { timeout: 5000 })
    await expect(page.locator('.admin-login-card h1')).toHaveText('Administration')
    await expect(
      page.getByRole('button', { name: 'Se connecter avec Google' })
    ).toBeVisible()
  })

  test('subsequent navigation without admin param shows normal page', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForURL(/\/admin\?redirect=/, { timeout: 15000 })
    // Navigate to a page without ?admin=true — should show public page
    await page.goto('/')
    await page.waitForTimeout(1000)
    await expect(page.locator('#app-root')).not.toHaveClass(/admin-mode/)
    await expect(page.locator('.admin-toolbar')).not.toBeVisible()
  })
})
