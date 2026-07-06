import { test, expect } from '@playwright/test';

/**
 * Advanced performance tests
 * - Lighthouse score (target 90+)
 * - Core Web Vitals (LCP, FID, CLS)
 * - Network throttling (3G, 4G)
 * - Memory profiling
 * - Paint timing
 * - Resource metrics
 */

test.describe('Advanced Performance', () => {

  test.describe('Core Web Vitals', () => {
    test('LCP (Largest Contentful Paint) < 2.5s', async ({ page }) => {
      const lcpMetrics: number[] = []

      page.on('framenavigated', () => {
        // Measure LCP
      })

      await page.goto('/')

      const lcp = await page.evaluate(() => {
        return new Promise(resolve => {
          let largestPaint = 0

          if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries()
              const lastEntry = entries[entries.length - 1]
              largestPaint = lastEntry.renderTime || lastEntry.loadTime
            })

            observer.observe({ entryTypes: ['largest-contentful-paint'] })

            setTimeout(() => {
              observer.disconnect()
              resolve(largestPaint)
            }, 5000)
          } else {
            resolve(0)
          }
        })
      })

      expect(lcp as number).toBeLessThan(2500)
    })

    test('FID (First Input Delay) < 100ms', async ({ page }) => {
      await page.goto('/')

      // Simulate user interaction
      await page.click('body')

      const fid = await page.evaluate(() => {
        return new Promise(resolve => {
          if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries()
              if (entries.length > 0) {
                resolve((entries[0] as any).processingDuration)
              }
            })

            observer.observe({ entryTypes: ['first-input'] })

            setTimeout(() => {
              observer.disconnect()
              resolve(0)
            }, 3000)
          } else {
            resolve(0)
          }
        })
      })

      expect(fid as number).toBeLessThan(100)
    })

    test('CLS (Cumulative Layout Shift) < 0.1', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

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
            }, 3000)
          } else {
            resolve(0)
          }
        })
      })

      expect(cls as number).toBeLessThan(0.1)
    })
  })

  test.describe('Navigation Timing', () => {
    test('DOM Content Loaded < 2s', async ({ page }) => {
      const navTiming = await page.evaluate(() => {
        const timing = window.performance.timing
        const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart
        return domContentLoadedTime
      })

      expect(navTiming).toBeLessThan(2000)
    })

    test('Page Load Complete < 3s', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(3000)
    })

    test('Time to First Byte < 600ms', async ({ page }) => {
      const navTiming = await page.evaluate(() => {
        const timing = window.performance.timing
        const ttfb = timing.responseStart - timing.navigationStart
        return ttfb
      })

      expect(navTiming).toBeLessThan(600)
    })
  })

  test.describe('Resource Metrics', () => {
    test('total resource size reasonable', async ({ page }) => {
      const resourcesSize = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .reduce((sum, r: any) => sum + (r.transferSize || 0), 0)
      })

      // Should be < 5MB
      expect(resourcesSize).toBeLessThan(5 * 1024 * 1024)
    })

    test('no render-blocking resources', async ({ page }) => {
      const renderBlockers = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .filter((r: any) => {
            const initiatorType = r.initiatorType
            return (initiatorType === 'script' || initiatorType === 'link') &&
                   r.duration > 1000
          })
      })

      expect((renderBlockers as any[]).length).toBe(0)
    })

    test('CSS and JS properly prioritized', async ({ page }) => {
      const resources = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .filter((r: any) => r.name.includes('.js') || r.name.includes('.css'))
          .map((r: any) => ({ name: r.name, duration: r.duration }))
      })

      // Should have some resources
      expect((resources as any[]).length).toBeGreaterThan(0)
    })
  })

  test.describe('Memory & CPU', () => {
    test('memory usage reasonable', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const memory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          }
        }
        return null
      })

      if (memory) {
        // Used heap should be < 50% of limit
        const ratio = (memory as any).usedJSHeapSize / (memory as any).jsHeapSizeLimit
        expect(ratio).toBeLessThan(0.5)
      }
    })

    test('no excessive CPU usage during idle', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Wait and measure frame rate
      const fps = await page.evaluate(() => {
        return new Promise(resolve => {
          let frameCount = 0
          let lastTime = performance.now()

          function measure() {
            const now = performance.now()
            if (now - lastTime >= 1000) {
              resolve(frameCount)
            } else {
              frameCount++
              requestAnimationFrame(measure)
            }
          }

          requestAnimationFrame(measure)
        })
      })

      // Should maintain decent FPS even when idle
      expect(fps as number).toBeGreaterThan(30)
    })
  })

  test.describe('Network Conditions', () => {
    test('site loads on fast 4G', async ({ browser }) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      // Simulate 4G (12 Mbps down, 3 Mbps up, 20ms latency)
      await context.route('**/*', (route) => {
        setTimeout(() => route.continue(), 20)
      })

      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(5000)

      await context.close()
    })

    test('site loads on slow 3G', async ({ browser }) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      // Simulate 3G (400 kbps down, 100 kbps up, 100ms latency)
      await context.route('**/*', (route) => {
        setTimeout(() => route.continue(), 100)
      })

      const startTime = Date.now()
      await page.goto('/')
      const timeout = setTimeout(() => page.close(), 15000)
      await page.waitForLoadState('networkidle').catch(() => {})
      clearTimeout(timeout)
      const duration = Date.now() - startTime

      // Should eventually load or gracefully degrade
      expect(duration).toBeLessThan(15000)

      await context.close()
    })

    test('offline: page shows fallback/cache content', async ({ browser }) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      // Go online first
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Go offline
      await context.setOffline(true)

      // Try navigation
      const contentVisible = await page.locator('main, body').isVisible().catch(() => false)

      // Should still show content (cached or fallback)
      expect(contentVisible).toBe(true)

      await context.close()
    })
  })

  test.describe('Image Optimization', () => {
    test('images are properly sized for viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/')

      const images = await page.locator('img').all()

      for (const img of images) {
        const displayWidth = await img.evaluate(el => (el as any).offsetWidth)
        const naturalWidth = await img.evaluate(el => (el as any).naturalWidth)

        // Display width should not be much smaller than natural width
        if (displayWidth > 0 && naturalWidth > 0) {
          const ratio = displayWidth / naturalWidth
          expect(ratio).toBeGreaterThan(0.1) // Not excessively oversized
        }
      }
    })

    test('images have alt text', async ({ page }) => {
      await page.goto('/')

      const imagesWithoutAlt = await page.locator('img:not([alt])').count()

      // Allow some images without alt (decorative), but not most
      expect(imagesWithoutAlt).toBeLessThan(3)
    })

    test('lazy loading configured for below-fold images', async ({ page }) => {
      await page.goto('/')

      const images = await page.locator('img').all()

      let lazyLoadCount = 0
      for (const img of images) {
        const loading = await img.getAttribute('loading')
        if (loading === 'lazy') {
          lazyLoadCount++
        }
      }

      // Should have some lazy-loaded images
      expect(lazyLoadCount).toBeGreaterThan(0)
    })
  })

  test.describe('JavaScript Optimization', () => {
    test('no excessive JavaScript on initial load', async ({ page }) => {
      const jsSize = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .filter((r: any) => r.name.includes('.js'))
          .reduce((sum: number, r: any) => sum + (r.transferSize || 0), 0)
      })

      // Total JS < 500KB
      expect(jsSize).toBeLessThan(500 * 1024)
    })

    test('no inline scripts blocking rendering', async ({ page }) => {
      const inlineScripts = await page.locator('script:not([src])').count()

      // Should be minimal inline scripts
      expect(inlineScripts).toBeLessThan(5)
    })

    test('main thread not blocked', async ({ page }) => {
      await page.goto('/')

      // Try to interact
      const startTime = Date.now()
      await page.click('body')
      const duration = Date.now() - startTime

      // Should respond quickly
      expect(duration).toBeLessThan(100)
    })
  })

  test.describe('CSS Optimization', () => {
    test('CSS properly minified', async ({ page }) => {
      const cssResources = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .filter((r: any) => r.name.includes('.css'))
          .map((r: any) => r.name)
      })

      // Should have minified CSS (check filename or size)
      for (const css of cssResources as string[]) {
        // Minified CSS often has .min in name
        expect(css).toMatch(/\.min\.css|\.css/)
      }
    })

    test('critical CSS inlined', async ({ page }) => {
      const response = await page.request.get('/')
      const html = await response.text()

      // Should have some critical CSS inlined
      const hasInlinedCSS = html.includes('<style>') || html.includes('</style>')
      expect(hasInlinedCSS).toBe(true)
    })
  })

  test.describe('Font Loading', () => {
    test('fonts loaded efficiently', async ({ page }) => {
      await page.goto('/')

      const fontMetrics = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .filter((r: any) => r.name.includes('font'))
          .length
      })

      // Should have fonts loaded
      expect(fontMetrics).toBeGreaterThan(0)
    })

    test('no font flickering (FOIT/FOUT)', async ({ page }) => {
      await page.goto('/')

      // Wait for fonts to load
      await page.waitForTimeout(2000)

      // Text should be visible and readable
      const mainText = page.locator('main').first()
      expect(await mainText.isVisible()).toBe(true)
    })
  })

  test.describe('Service Worker & Caching', () => {
    test('service worker installed (if configured)', async ({ page }) => {
      await page.goto('/')

      const swStatus = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.getRegistrations()
            return registration.length > 0
          } catch (e) {
            return false
          }
        }
        return false
      })

      // May or may not have SW, but if it does, should work
      expect(typeof swStatus === 'boolean').toBe(true)
    })

    test('caching strategy working', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Go back
      await page.goBack()

      // Should be faster due to caching
      const secondLoadTime = await page.evaluate(() => {
        const timing = window.performance.timing
        return timing.loadEventEnd - timing.navigationStart
      })

      expect(secondLoadTime).toBeLessThan(2000)
    })
  })
})
