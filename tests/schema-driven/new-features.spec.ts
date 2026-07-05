import { test, expect } from '@playwright/test'

test.describe('Undo/Redo system', () => {

  test('undo button exists and is disabled initially (no history)', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const undoBtn = page.locator('.admin-icon-btn').first()
    await expect(undoBtn).toBeAttached()
    await expect(undoBtn).toBeDisabled()
  })

  test('redo button exists and is disabled initially', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const redoBtn = page.locator('.admin-icon-btn').nth(1)
    await expect(redoBtn).toBeAttached()
    await expect(redoBtn).toBeDisabled()
  })

  test('undo becomes enabled after modifying a block', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const wrapper = page.locator('.block-wrapper').first()
    // force: animations scroll-driven → élément jamais « stable » pour Playwright.
    await wrapper.click({ force: true })
    await page.waitForTimeout(300)
    // Le premier bloc ne peut pas « monter » (no-op) → on utilise « Descendre »
    // (2e bouton) pour produire une modification qui active l'undo.
    const moveDown = page.locator('.admin-action-btn').nth(1)
    if (await moveDown.isVisible()) {
      await moveDown.click({ force: true })
      await page.waitForTimeout(200)
      const undoBtn = page.locator('.admin-icon-btn').first()
      await expect(undoBtn).not.toBeDisabled()
    }
  })

  test('Ctrl+Z triggers undo without throwing', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const wrapper = page.locator('.block-wrapper').first()
    await wrapper.click()
    await page.waitForTimeout(300)
    const moveUp = page.locator('.admin-action-btn').first()
    if (await moveUp.isVisible()) {
      await moveUp.click()
      await page.waitForTimeout(200)
      const errors: string[] = []
      page.on('pageerror', err => errors.push(err.message))
      await page.keyboard.press('Control+z')
      await page.waitForTimeout(200)
      expect(errors.length).toBe(0)
    }
  })

  test('Ctrl+Shift+Z triggers redo without throwing', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const wrapper = page.locator('.block-wrapper').first()
    await wrapper.click()
    await page.waitForTimeout(300)
    const moveUp = page.locator('.admin-action-btn').first()
    if (await moveUp.isVisible()) {
      await moveUp.click()
      await page.waitForTimeout(200)
      await page.keyboard.press('Control+z')
      await page.waitForTimeout(200)
      const errors: string[] = []
      page.on('pageerror', err => errors.push(err.message))
      await page.keyboard.press('Control+Shift+z')
      await page.waitForTimeout(200)
      expect(errors.length).toBe(0)
    }
  })
})

test.describe('Drag-and-drop', () => {

  test('drag handle is attached in admin mode', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    await expect(page.locator('.drag-handle').first()).toBeAttached()
  })

  test('drag handle has grip icon', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const text = await page.locator('.drag-handle').first().textContent()
    expect(text).toBeTruthy()
    expect(text?.trim()).toBe('⠿')
  })

  test('drag handle is present on blocks in admin mode', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    await expect(page.locator('.drag-handle').first()).toBeAttached()
  })

  test('drag handle is absent in public mode', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    await expect(page.locator('.drag-handle')).toHaveCount(0)
  })

  test('block ghost CSS class is defined', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const hasGhostRule = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if ((rule as CSSStyleRule).selectorText?.includes('.block-ghost')) return true
          }
        } catch (_) {}
      }
      return false
    })
    expect(hasGhostRule).toBe(true)
  })
})

test.describe('Page transitions', () => {

  test('page transition CSS classes exist in stylesheet', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    const hasPageTransition = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if ((rule as CSSStyleRule).selectorText?.includes('page-enter-active')) return true
          }
        } catch (_) {}
      }
      return false
    })
    expect(hasPageTransition).toBe(true)
  })
})

test.describe('Auto-save', () => {

  test('logged out: ?admin=true redirects to the login page with sign-in button', async ({ page }) => {
    // Comportement auth-gated réel : un visiteur déconnecté qui demande le
    // mode édition est redirigé vers /admin (page de connexion).
    await page.addInitScript(() => { (window as any).__MOCK_AUTH_RESULT = null })
    await page.goto('/?admin=true')
    await page.waitForURL(/\/admin/, { timeout: 15000 })
    await expect(page.locator('.admin-login-card')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Se connecter avec Google' })).toBeVisible()
  })

  test('logged out: no page-save button is reachable', async ({ page }) => {
    // Sans connexion, la barre d'édition et son bouton de sauvegarde ne sont
    // jamais accessibles (redirection vers la page de connexion).
    await page.addInitScript(() => { (window as any).__MOCK_AUTH_RESULT = null })
    await page.goto('/?admin=true')
    await page.waitForURL(/\/admin/, { timeout: 15000 })
    const saveBtn = page.locator('.admin-btn:not(.admin-btn-secondary):not(.admin-btn-login)')
    await expect(saveBtn).not.toBeVisible()
  })
})

test.describe('Safari animation fallback', () => {

  test('block-wrapper elements exist (animation trigger containers)', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const count = await page.locator('.block-wrapper').count()
    expect(count).toBeGreaterThan(0)
  })

  test('triggered class applied in admin mode (pre-triggered blocks)', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)
    const triggered = page.locator('.block-wrapper.triggered')
    const count = await triggered.count()
    expect(count).toBeGreaterThan(0)
  })

  test('block-anim CSS classes exist on wrappers', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const withAnim = page.locator('[class*="block-anim-"]')
    const count = await withAnim.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Admin mode UI integrity', () => {

  test('admin toolbar is present', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    await expect(page.locator('.admin-toolbar')).toBeAttached()
  })

  test('page select dropdown works', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const select = page.locator('.admin-page-select')
    await expect(select).toBeAttached()
    const value = await select.inputValue()
    expect(typeof value).toBe('string')
  })

  test('server-side renders without errors in admin mode', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    // 'load' plutôt que 'networkidle' : la connexion temps réel Firebase
    // garde le réseau actif, donc networkidle ne se stabilise jamais.
    await page.goto('/?admin=true', { waitUntil: 'load' })
    await page.waitForTimeout(1500)
    expect(errors.length).toBe(0)
  })
})

test.describe('Accessibility', () => {

  test('page has lang="fr" attribute', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    const lang = await page.evaluate(() => document.documentElement.lang)
    expect(lang).toBe('fr')
  })

  test('admin toolbar has no unlabelled interactive elements', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(1500)
    const buttons = page.locator('.admin-icon-btn')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toHaveAttribute('title')
    }
  })
})
