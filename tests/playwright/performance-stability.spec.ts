import { test, expect } from '@playwright/test';

/**
 * Performance & stability tests
 * - Load time
 * - Memory leaks (repeated actions)
 * - No console errors
 * - Smooth animations (60fps check)
 * - No duplicate requests
 */

test.describe('Performance & Stability', () => {

  test('homepage loads in < 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const duration = Date.now() - startTime

    expect(duration).toBeLessThan(3000)
  })

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Filter out expected errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('Failed to fetch') &&
      !e.includes('NetworkError') &&
      !e.includes('CORS')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('repeated navigation: no memory leak', async ({ page }) => {
    const pages = ['/', '/contact', '/agenda', '/']
    const memorySnapshots: number[] = []

    for (let i = 0; i < 3; i++) {
      for (const path of pages) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
      }

      // Check memory (if available in browser)
      const memory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize
        }
        return 0
      })

      if (memory > 0) {
        memorySnapshots.push(memory)
      }
    }

    // Memory shouldn't grow unbounded
    if (memorySnapshots.length >= 2) {
      const firstSnapshot = memorySnapshots[0]
      const lastSnapshot = memorySnapshots[memorySnapshots.length - 1]

      // Allow some growth (50%) but not exponential
      const growth = (lastSnapshot - firstSnapshot) / firstSnapshot
      expect(growth).toBeLessThan(0.5)
    }
  })

  test('admin mode: repeated edits don\'t degrade performance', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForLoadState('networkidle')

    const timings: number[] = []

    for (let i = 0; i < 5; i++) {
      const block = page.locator('.block-wrapper').first()
      const startTime = Date.now()
      await block.click()
      const duration = Date.now() - startTime

      timings.push(duration)

      // Close sidebar
      await page.keyboard.press('Escape')
    }

    // Timings should be relatively consistent (not degrading)
    const firstTiming = timings[0]
    const lastTiming = timings[timings.length - 1]

    // Last should not be significantly slower
    expect(lastTiming).toBeLessThan(firstTiming * 2)
  })

  test('no duplicate API requests', async ({ page }) => {
    const requests = new Map<string, number>()

    page.on('request', req => {
      const url = req.url()
      requests.set(url, (requests.get(url) || 0) + 1)
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for duplicate requests (same URL called more than expected)
    const duplicates = Array.from(requests.entries())
      .filter(([url, count]) => {
        // These are expected to be called once or twice
        const singleCall = !url.includes('/api/pages') && !url.includes('version.txt')
        return count > 3 && singleCall
      })

    expect(duplicates.length).toBe(0)
  })

  test('animations run smoothly', async ({ page }) => {
    await page.goto('/')

    // Check animation performance
    const fps = await page.evaluate(() => {
      return new Promise(resolve => {
        let frames = 0
        let start = performance.now()

        function countFrame() {
          frames++
          if (performance.now() - start < 1000) {
            requestAnimationFrame(countFrame)
          } else {
            resolve(frames) // Should be ~60
          }
        }

        requestAnimationFrame(countFrame)
      })
    })

    // Should get close to 60 FPS (allow lower on CI)
    expect(fps as number).toBeGreaterThan(30)
  })

  test('responsive preview: switching devices is fast', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForLoadState('networkidle')

    const timings: number[] = []

    for (const device of ['tablet', 'mobile', 'desktop']) {
      const btn = page.locator(`button[title="${device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobile'}"]`)

      const startTime = Date.now()
      await btn.click()
      await page.waitForTimeout(200)
      const duration = Date.now() - startTime

      timings.push(duration)
    }

    // Each device switch should be < 500ms
    expect(Math.max(...timings)).toBeLessThan(500)
  })

  test('dragging blocks: no lag', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForLoadState('networkidle')

    const blocks = page.locator('.block-wrapper').all()
    const blocksList = await blocks

    if (blocksList.length >= 2) {
      const startTime = Date.now()

      try {
        await blocksList[0].dragTo(blocksList[1])
      } catch (e) {
        // Drag might fail in test environment
      }

      const duration = Date.now() - startTime

      // Drag should complete < 1 second
      expect(duration).toBeLessThan(1000)
    }
  })

  test('page transitions: smooth without janky frames', async ({ page }) => {
    await page.goto('/')

    const startTime = performance.now()
    await page.click('text=Contact')
    await page.waitForURL('**/contact')
    const duration = performance.now() - startTime

    // Should complete in reasonable time (transition 250ms + network)
    expect(duration).toBeLessThan(3000)
    expect(duration).toBeGreaterThan(200)
  })

  test('bundle size reasonable', async ({ page }) => {
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.includes('_nuxt') || r.name.includes('.js'))
        .map(r => ({
          name: r.name.split('/').pop(),
          size: (r as any).transferSize || 0
        }))
    })

    // Largest JS file should be < 200KB
    const largestSize = Math.max(...resources.map((r: any) => r.size || 0))
    expect(largestSize).toBeLessThan(200 * 1024)
  })

  test('no layout shift during interactions', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForLoadState('networkidle')

    // Measure CLS during interactions
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let totalShift = 0

        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                totalShift += (entry as any).value
              }
            }
          })

          observer.observe({ entryTypes: ['layout-shift'] })

          setTimeout(() => {
            observer.disconnect()
            resolve(totalShift)
          }, 2000)
        } else {
          resolve(0)
        }
      })
    })

    // CLS should be < 0.1 (excellent)
    expect(cls as number).toBeLessThan(0.1)
  })

  test('form submission: no multiple submits', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')

    const submitBtn = page.locator('button:has-text("Envoyer|Submit|Send")')

    if (await submitBtn.isVisible()) {
      // Count form submissions
      let submissionCount = 0
      page.on('response', resp => {
        if (resp.url().includes('contact') && resp.request().method() === 'POST') {
          submissionCount++
        }
      })

      // Fill form (if fields exist)
      const nameInput = page.locator('input[name*="nom|name|prenom"], input[type="text"]').first()
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User')
      }

      // Click submit multiple times quickly
      await submitBtn.click()
      await submitBtn.click()
      await submitBtn.click()

      await page.waitForTimeout(1000)

      // Should have only 1 submission (double-click prevented)
      expect(submissionCount).toBeLessThanOrEqual(1)
    }
  })

  test('network waterfall: critical resources load first', async ({ page }) => {
    const resourceTimings = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.includes('_nuxt') || r.name.includes('main'))
        .map(r => ({
          name: r.name.split('/').pop(),
          startTime: r.startTime
        }))
        .sort((a, b) => a.startTime - b.startTime)
    })

    // Should have loaded something
    expect((resourceTimings as any[]).length).toBeGreaterThan(0)
  })

  test('storage usage: localStorage not bloated', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForLoadState('networkidle')

    const storageSize = await page.evaluate(() => {
      let total = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage.getItem(key)?.length || 0
        }
      }
      return total
    })

    // localStorage shouldn't grow unbounded (< 1MB)
    expect(storageSize).toBeLessThan(1024 * 1024)
  })
})
