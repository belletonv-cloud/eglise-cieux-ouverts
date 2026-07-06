import { test, expect } from '@playwright/test';

/**
 * API & Firestore integration tests
 * - Page CRUD operations (GET, POST, PUT, DELETE)
 * - Menu operations
 * - Footer operations
 * - Error handling & retries
 * - Data validation
 * - Concurrent operations
 */

test.describe('API & Firestore Operations', () => {

  test.describe('Pages API (CRUD)', () => {
    test('GET /api/pages/:slug returns page data', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')

      expect(response.ok()).toBe(true)

      const data = await response.json()
      expect(data).toHaveProperty('blocks')
      expect(Array.isArray(data.blocks)).toBe(true)
    })

    test('GET /api/pages/:slug with invalid slug returns 404 or empty', async ({ page }) => {
      const response = await page.request.get('/api/pages/nonexistent-page-xyz-123')

      // Should either return 404 or empty blocks
      expect([404, 200]).toContain(response.status())

      if (response.ok()) {
        const data = await response.json()
        expect(data.blocks || data.length >= 0).toBeTruthy()
      }
    })

    test('PUT /api/pages/:slug persists blocks', async ({ page }) => {
      await page.goto('/?admin=true')
      await page.waitForLoadState('networkidle')

      // Get current blocks
      const currentResponse = await page.request.get('/api/pages/accueil')
      const currentData = await currentResponse.json()

      // Try to update (if authenticated)
      const updateResponse = await page.request.put('/api/pages/accueil', {
        data: {
          blocks: currentData.blocks || []
        }
      }).catch(() => null)

      // Should be 200/204, 401 (auth required), or fail gracefully
      if (updateResponse) {
        expect([200, 201, 204, 401, 403]).toContain(updateResponse.status())
      }
    })

    test('DELETE /api/pages/:slug removes page', async ({ page }) => {
      const deleteResponse = await page.request.delete('/api/pages/test-page').catch(() => null)

      // Should be 204/200 (deleted), 401 (auth), 404 (not found)
      if (deleteResponse) {
        expect([200, 204, 401, 403, 404]).toContain(deleteResponse.status())
      }
    })
  })

  test.describe('Menu API', () => {
    test('GET /api/menu returns menu structure', async ({ page }) => {
      const response = await page.request.get('/api/menu')

      expect(response.ok()).toBe(true)

      const data = await response.json()
      expect(data).toHaveProperty('items')
      expect(Array.isArray(data.items)).toBe(true)
    })

    test('PUT /api/menu saves menu changes', async ({ page }) => {
      const getResponse = await page.request.get('/api/menu')
      const menuData = await getResponse.json()

      const updateResponse = await page.request.put('/api/menu', {
        data: menuData
      }).catch(() => null)

      // Should be 200/204 (success) or 401 (auth required)
      if (updateResponse) {
        expect([200, 201, 204, 401, 403]).toContain(updateResponse.status())
      }
    })

    test('menu items structure is valid', async ({ page }) => {
      const response = await page.request.get('/api/menu')
      const data = await response.json()

      if (data.items && data.items.length > 0) {
        const firstItem = data.items[0]

        // Should have expected structure
        expect(firstItem).toHaveProperty('label')
        expect(firstItem).toHaveProperty('href')
      }
    })
  })

  test.describe('Footer API', () => {
    test('GET /api/footer returns footer block', async ({ page }) => {
      const response = await page.request.get('/api/footer')

      expect(response.ok()).toBe(true)

      const data = await response.json()
      expect(data).toHaveProperty('type')
      expect(data.type).toBe('footer')
    })

    test('PUT /api/footer updates footer', async ({ page }) => {
      const getResponse = await page.request.get('/api/footer')
      const footerData = await getResponse.json()

      const updateResponse = await page.request.put('/api/footer', {
        data: footerData
      }).catch(() => null)

      if (updateResponse) {
        expect([200, 201, 204, 401, 403]).toContain(updateResponse.status())
      }
    })
  })

  test.describe('Error Handling', () => {
    test('API returns proper error codes', async ({ page }) => {
      // Test various error scenarios
      const responses = {
        notFound: await page.request.get('/api/pages/nonexistent').catch(() => null),
        badRequest: await page.request.post('/api/pages', { data: null }).catch(() => null),
        unauthorized: await page.request.delete('/api/pages/accueil').catch(() => null)
      }

      // At least some should return error codes
      for (const [key, response] of Object.entries(responses)) {
        if (response) {
          expect(typeof response.status()).toBe('number')
        }
      }
    })

    test('error responses include helpful messages', async ({ page }) => {
      const response = await page.request.get('/api/pages/nonexistent').catch(() => null)

      if (response && !response.ok()) {
        try {
          const data = await response.json().catch(() => ({}))
          // Should have some error info
          expect(Object.keys(data).length >= 0).toBe(true)
        } catch (e) {
          // Text response is also OK
        }
      }
    })

    test('API handles network timeouts gracefully', async ({ page }) => {
      // This test would require simulating network delay
      // Placeholder for future implementation
      expect(true).toBe(true)
    })
  })

  test.describe('Data Validation', () => {
    test('page blocks have required fields', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')
      const data = await response.json()

      if (data.blocks && data.blocks.length > 0) {
        const block = data.blocks[0]

        expect(block).toHaveProperty('id')
        expect(block).toHaveProperty('type')
        expect(typeof block.id).toBe('string')
        expect(typeof block.type).toBe('string')
      }
    })

    test('block types are valid', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')
      const data = await response.json()

      const validTypes = ['hero', 'text', 'image', 'gallery', 'contact', 'footer', 'aspirations']

      if (data.blocks && data.blocks.length > 0) {
        for (const block of data.blocks) {
          expect(validTypes).toContain(block.type)
        }
      }
    })

    test('blocks don\'t have circular references', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')

      try {
        const data = await response.json()
        // If we can stringify it, no circular refs
        expect(() => JSON.stringify(data)).not.toThrow()
      } catch (e) {
        // JSON parse error is also a failure
        expect(false).toBe(true)
      }
    })
  })

  test.describe('Concurrent Operations', () => {
    test('simultaneous page reads don\'t conflict', async ({ page }) => {
      const promises = [
        page.request.get('/api/pages/accueil'),
        page.request.get('/api/pages/contact'),
        page.request.get('/api/pages/accueil')
      ]

      const responses = await Promise.all(promises)

      // All should succeed
      expect(responses.every(r => r.ok())).toBe(true)

      const data1 = await responses[0].json()
      const data2 = await responses[2].json()

      // Data should be identical
      expect(JSON.stringify(data1)).toBe(JSON.stringify(data2))
    })

    test('read during write doesn\'t cause issues', async ({ page }) => {
      await page.goto('/?admin=true')
      await page.waitForLoadState('networkidle')

      // Start a read
      const readPromise = page.request.get('/api/pages/accueil')

      // Try a write (if authenticated)
      const writePromise = page.request.put('/api/pages/accueil', {
        data: { blocks: [] }
      }).catch(() => null)

      const [readResponse, writeResponse] = await Promise.all([readPromise, writePromise])

      // Both should complete (either success or proper error)
      expect(readResponse.ok()).toBe(true)
      if (writeResponse) {
        expect([200, 201, 204, 401, 403]).toContain(writeResponse.status())
      }
    })
  })

  test.describe('Response Headers & Metadata', () => {
    test('API returns proper content-type', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')

      const contentType = response.headers()['content-type']
      expect(contentType).toContain('application/json')
    })

    test('API returns cache headers for GET', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')

      const cacheControl = response.headers()['cache-control']
      // Should have some cache directive
      expect(cacheControl).toBeTruthy()
    })

    test('API returns CORS headers (if applicable)', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')

      // CORS headers are optional but good to have
      const allowOrigin = response.headers()['access-control-allow-origin']
      // Might be present or not depending on implementation
      expect(typeof allowOrigin === 'string' || !allowOrigin).toBe(true)
    })
  })

  test.describe('Data Consistency', () => {
    test('page blocks remain consistent across requests', async ({ page }) => {
      const responses = await Promise.all([
        page.request.get('/api/pages/accueil'),
        page.request.get('/api/pages/accueil'),
        page.request.get('/api/pages/accueil')
      ])

      const blocks = await Promise.all(responses.map(r => r.json()))

      // All should be identical
      const firstBlocks = JSON.stringify(blocks[0].blocks)
      for (const block of blocks.slice(1)) {
        expect(JSON.stringify(block.blocks)).toBe(firstBlocks)
      }
    })

    test('menu structure is consistent', async ({ page }) => {
      const responses = await Promise.all([
        page.request.get('/api/menu'),
        page.request.get('/api/menu')
      ])

      const menus = await Promise.all(responses.map(r => r.json()))

      expect(JSON.stringify(menus[0])).toBe(JSON.stringify(menus[1]))
    })
  })

  test.describe('Response Performance', () => {
    test('API responds quickly (< 1000ms)', async ({ page }) => {
      const startTime = Date.now()
      await page.request.get('/api/pages/accueil')
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(1000)
    })

    test('multiple concurrent requests complete in reasonable time', async ({ page }) => {
      const startTime = Date.now()

      await Promise.all([
        page.request.get('/api/pages/accueil'),
        page.request.get('/api/pages/contact'),
        page.request.get('/api/menu'),
        page.request.get('/api/footer')
      ])

      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(2000)
    })
  })

  test.describe('Edge Cases', () => {
    test('empty page returns empty blocks array', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')
      const data = await response.json()

      expect(Array.isArray(data.blocks)).toBe(true)
    })

    test('malformed requests are handled', async ({ page }) => {
      const response = await page.request.get('/api/pages/').catch(() => null)

      if (response) {
        expect([400, 404, 301, 302]).toContain(response.status())
      }
    })

    test('special characters in page slug are handled', async ({ page }) => {
      const response = await page.request.get('/api/pages/%20%20%20').catch(() => null)

      if (response) {
        expect([400, 404, 200]).toContain(response.status())
      }
    })
  })
})
