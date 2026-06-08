import { test, expect } from '@playwright/test'
import { loginAsAdmin, expectAdminBadge } from './helpers/admin'

const DEFAULT_BLOCK_COUNT = 8

test.describe('Blocs dupliqués', () => {
  test('sans admin : le bon nombre de blocs (8) est rendu', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.block-wrapper', { timeout: 5000 })

    const blocks = page.locator('.block-wrapper')
    const count = await blocks.count()
    expect(count).toBe(DEFAULT_BLOCK_COUNT)
  })

  test('avec admin=true : le bon nombre de blocs (8) est rendu, pas de doublons', async ({ page }) => {
    await loginAsAdmin(page, '/')

    const blocks = page.locator('.block-wrapper')
    const count = await blocks.count()
    expect(count).toBe(DEFAULT_BLOCK_COUNT)
  })

  test('les IDs des blocs sont uniques', async ({ page }) => {
    await loginAsAdmin(page, '/')

    const ids = await page.locator('.block-wrapper').evaluateAll(elements =>
      elements.map(el => el.getAttribute('data-block-id'))
    )
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  test('le hero block a du contenu visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.block-wrapper', { timeout: 5000 })
    const heroSectionCount = await page.locator('.block-hero').count()
    expect(heroSectionCount).toBe(1)

    const hero = page.locator('.block-hero').first()
    await expect(hero).toBeVisible()

    const hasTitle = await hero.locator('.hero-title').count()
    const hasName = await hero.locator('.hero-name').count()
    const hasLogo = await hero.locator('.hero-logo').count()

    expect(hasTitle + hasName + hasLogo).toBeGreaterThan(0)
  })

  test('navigation vers contact : même bloc qu en fallback', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForSelector('.block-wrapper[data-block-type="contact"]', { timeout: 5000 })

    const blocks = page.locator('.block-wrapper')
    const count = await blocks.count()
    expect(count).toBe(1)
  })

  test('admin mode : les blocs ne sont pas rendus deux fois apres hydratation', async ({ page }) => {
    await loginAsAdmin(page, '/')

    const wrapper = page.locator('.page-renderer')
    const blockWrappers = wrapper.locator('> .block-wrapper, > .drag-container > .block-wrapper')

    const wrappers = wrapper.locator('.block-wrapper')
    const visibleCount = await wrappers.count()
    expect(visibleCount).toBe(DEFAULT_BLOCK_COUNT)
  })

  test('API retourne des blocs sans doublons', async ({ page }) => {
    const response = await page.request.get('/api/pages/accueil')
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.blocks).toBeDefined()
    expect(Array.isArray(data.blocks)).toBe(true)

    const ids = data.blocks.map(b => b.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
