import { test, expect } from '@playwright/test'

test.describe('Aspirations animation', () => {
  test('items activate one by one on scroll', async ({ page }) => {
    await page.goto('http://localhost:3001/')

    const viewport = page.locator('.aspirations-viewport')
    await expect(viewport).toBeVisible({ timeout: 10000 })

    const aspirations = page.locator('.block-aspirations')
    const circles = page.locator('.aspiration-circle')
    const lines = page.locator('.aspiration-line')

    const count = await circles.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      await page.evaluate(({ idx, cnt }) => {
        const viewportEl = document.querySelector('.aspirations-viewport')
        if (!viewportEl) return
        const vh = window.innerHeight
        const range_start = vh
        const range_end = 0
        const range = range_start - range_end
        const lineTotal = 1 / cnt
        const startP = idx * lineTotal

        const viewport_rect = viewportEl.getBoundingClientRect()
        const viewport_top = viewport_rect.top
        let currentProgress = 0
        if (range > 0) {
          currentProgress = Math.max(0, Math.min(1, (range_start - viewport_top) / range))
        }

        const desiredProgress = startP + 0.01
        if (currentProgress < desiredProgress) {
          const needed_viewport_top = range_start - desiredProgress * range
          const viewport_top_document = viewport_rect.top + window.scrollY
          const target_scroll_y = Math.max(0, Math.floor(viewport_top_document - needed_viewport_top))
          window.scrollTo({ top: target_scroll_y, behavior: 'auto' })
        }
      }, { idx: i, cnt: count })

      await page.waitForTimeout(250)

      const circle = circles.nth(i)
      const line = lines.nth(i)

      await expect(circle).toHaveClass(/is-active/, { timeout: 3000 })
      await expect(line).toHaveClass(/is-active/, { timeout: 3000 })
    }
  })
})
