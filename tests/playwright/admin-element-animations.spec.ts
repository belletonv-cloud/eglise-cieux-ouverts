import { test, expect } from '@playwright/test'

function collectErrors(page: import('@playwright/test').Page) {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('Hydration')) errors.push('console.error: ' + msg.text())
  })
  return errors
}

test.describe('Animations par élément (contrôleur provide/inject)', () => {
  test('public : les éléments enregistrés se déclenchent au scroll', async ({ page }) => {
    const errors = collectErrors(page)

    await page.goto('/')
    await page.waitForSelector('.vision-section', { timeout: 10000 })
    await page.waitForTimeout(500)

    // Le contrôleur est branché (Symbol partagé) : l'élément est enregistré
    // et porte sa classe d'animation
    const label = page.locator('.vision-label')
    await expect(label).toHaveClass(/block-anim-slideUp/)
    await expect(label).toHaveAttribute('data-anim-key', /:label$/)

    // Au scroll, l'observer d'éléments déclenche l'animation
    await label.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1200)
    await expect(label).toHaveClass(/triggered/)

    const opacity = await label.evaluate((el) => getComputedStyle(el).opacity)
    expect(parseFloat(opacity)).toBeGreaterThan(0.9)

    expect(errors, 'erreurs runtime en public').toEqual([])
  })

  test('navigations répétées : pas de refs DOM périmées ni erreur', async ({ page }) => {
    const errors = collectErrors(page)

    await page.goto('/')
    await page.waitForTimeout(800)
    for (const path of ['/messages', '/', '/event-list', '/']) {
      await page.locator(`a[href="${path}"]`).first().click().catch(() => page.goto(path))
      await page.waitForTimeout(600)
    }
    await page.locator('.vision-section').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)

    expect(errors, 'erreurs runtime après navigations répétées').toEqual([])
  })
})
