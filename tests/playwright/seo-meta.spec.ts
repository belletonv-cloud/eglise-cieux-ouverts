import { test, expect } from '@playwright/test'

async function getMetaContent(page: import('@playwright/test').Page, name: string): Promise<string | null> {
  return page.evaluate((n: string) => {
    const el = document.querySelector(`meta[name="${n}"], meta[property="${n}"]`)
    return el ? el.getAttribute('content') : null
  }, name)
}

test.describe('SEO meta tags', () => {
  test('homepage has correct meta tags', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const title = await page.title()
    expect(title).toContain('Cieux Ouverts')

    const description = await getMetaContent(page, 'description')
    expect(description).toContain('Bienvenue')

    const ogTitle = await getMetaContent(page, 'og:title')
    expect(ogTitle).toContain('Cieux Ouverts')

    const ogDesc = await getMetaContent(page, 'og:description')
    expect(ogDesc).toContain('Bienvenue')

    const ogImage = await getMetaContent(page, 'og:image')
    expect(ogImage).toContain('static.wixstatic.com')

    const ogType = await getMetaContent(page, 'og:type')
    expect(ogType).toBe('website')
  })

  test('messages page has correct title', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForLoadState('networkidle')

    const title = await page.title()
    expect(title).toContain('Messages')

    const description = await getMetaContent(page, 'description')
    expect(description).toContain('messages')
  })

  test('contact page has correct title', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')

    const title = await page.title()
    expect(title).toContain('Contact')

    const description = await getMetaContent(page, 'description')
    expect(description).toContain('Contactez')
  })

  test('admin page meta title is set', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    const title = await page.title()
    expect(title).toContain('Cieux Ouverts')
  })

  test('og meta tags exist on homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const ogTitle = await getMetaContent(page, 'og:title')
    const ogDesc = await getMetaContent(page, 'og:description')
    const ogImage = await getMetaContent(page, 'og:image')
    const ogUrl = await getMetaContent(page, 'og:url')

    expect(ogTitle).not.toBeNull()
    expect(ogDesc).not.toBeNull()
    expect(ogImage).not.toBeNull()
    expect(ogUrl).not.toBeNull()
  })

  test('agenda page has correct title', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    const title = await page.title()
    expect(title).toContain('Agenda')
  })
})
