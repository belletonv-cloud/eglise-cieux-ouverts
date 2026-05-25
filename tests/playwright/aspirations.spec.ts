import { test, expect } from './fixtures/global'

test.describe('Aspirations animation', () => {
  test('SSR content without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')

    // BlockAspirations
    await expect(page.locator('.aspirations-viewport')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.aspirations-viewport .circle')).toHaveCount(4)

    // BlockBienvenue — text must be visible (opacity 1 in SSR)
    await expect(page.locator('.block-bienvenue')).toBeVisible()
    await expect(page.locator('.hero-bienvenue-line').first()).toBeVisible()

    // BlockRejoins — must have .is-visible class (content visible)
    await expect(page.locator('.block-rejoins.is-visible')).toBeVisible()

    // BlockVision — must have .is-triggered class (content visible in no-JS)
    await expect(page.locator('.vision-section.is-triggered')).toBeVisible()
    await expect(page.locator('.vision-label')).toBeVisible()
    await expect(page.locator('.vision-quote')).toBeVisible()

    // Footer "Il y a une place pour toi !" — shutter chars must have in-view class
    await expect(page.locator('.shutter-char.in-view').first()).toBeVisible()
    await expect(page.locator('.footer-title')).toBeVisible()
    // Verify the text (spaces are &nbsp; = non-breaking \xa0)
    const footerText = await page.locator('.footer-title').innerText()
    expect(footerText.replace(/\xa0/g, ' ')).toContain('Il y a une place pour toi')

    await context.close()
  })

  test('page loads with JS without 500 error', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    await page.waitForTimeout(2000)

    // Verify no Nuxt error
    const title = await page.title()
    expect(title).not.toContain('500')
    expect(title).toContain('Cieux Ouverts')

    // Verify SSR blocks are present
    await expect(page.locator('.aspirations-viewport')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.block-bienvenue')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.block-rejoins')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.vision-section')).toBeVisible({ timeout: 5000 })

    // Verify no page errors
    expect(errors).toEqual([])
  })

  test('circles are rendered correctly', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    await page.waitForTimeout(1000)

    const viewport = page.locator('.aspirations-viewport')
    await expect(viewport).toBeVisible({ timeout: 5000 })

    const circles = page.locator('.aspirations-viewport .circle')
    const count = await circles.count()
    expect(count).toBe(4)

    const texts = page.locator('.aspirations-viewport .text')
    expect(await texts.count()).toBe(4)

    // Verify aspiration texts
    await expect(texts.nth(0)).toHaveText(/Accueillir/)
    await expect(texts.nth(1)).toHaveText(/Célébrer/)
    await expect(texts.nth(2)).toHaveText(/Accompagner/)
    await expect(texts.nth(3)).toHaveText(/Témoigner/)

    expect(errors).toEqual([])
  })
})
