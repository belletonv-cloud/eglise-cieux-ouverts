import { test, expect } from '@playwright/test'

test.describe('Aspirations animation', () => {
  test('items activate one by one on scroll', async ({ page }) => {
    await page.goto('http://localhost:3000/')

    // Wait for the aspirations section to be present
    const aspirations = page.locator('.block-aspirations')
    await expect(aspirations).toBeVisible({ timeout: 10000 })

    // Find circles and lines
    const circles = page.locator('.aspiration-circle')
    const lines = page.locator('.aspiration-line')

    const count = await circles.count()
    expect(count).toBeGreaterThan(0)

    // Scroll slowly down the section and observe that items gain the .is-active class sequentially
    // Instead of individually scrolling to each element (which can cause
    // reflow and detachment), perform controlled wheel scrolls over the
    // aspirations section and observe items activating in sequence.
    const box = await aspirations.boundingBox()
    if (!box) throw new Error('aspirations bounding box not found')

    // Start near the top of the section and perform incremental wheel scrolls
    // to simulate a user scrolling down. After each small scroll, check for
    // the next item's activation.
    const startY = Math.floor(box.y + 10)
    await page.mouse.move(Math.floor(box.x + box.width / 2), startY)

    for (let i = 0; i < count; i++) {
      // Compute the scroll position that corresponds to the component's
      // internal scrollProgress formula so we reliably trigger is-active.
      await page.evaluate(({ idx, cnt }) => {
        const el = document.querySelector('.block-aspirations')
        if (!el) return
        const vh = window.innerHeight
        const start = vh * 3
        const end = 0
        const lineTotal = 1 / cnt
        const startP = idx * lineTotal

        // we want rect.top such that scrollProgress >= startP
        // scrollProgress = 1 - ((rect.top - end) / (start - end))
        // => rect.top = start * (1 - startP)
        // nudge a bit further to ensure progress passes the threshold
        const desiredRectTop = start * (1 - startP) - 20

        const elTopDocument = el.getBoundingClientRect().top + window.scrollY
        const targetScrollY = Math.max(0, Math.floor(elTopDocument - desiredRectTop))
        window.scrollTo({ top: targetScrollY, behavior: 'auto' })
      }, { idx: i, cnt: count })

      // allow the scroll handler and CSS transitions to take effect
      await page.waitForTimeout(150)

      const circle = circles.nth(i)
      const line = lines.nth(i)

      await expect(circle).toHaveClass(/is-active/, { timeout: 3000 })
      await expect(line).toHaveClass(/is-active/, { timeout: 3000 })
    }
  })
})
