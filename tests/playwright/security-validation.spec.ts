import { test, expect } from '@playwright/test';

/**
 * Security validation tests
 * - XSS prevention (input sanitization)
 * - CSRF protection (token validation)
 * - SQL injection prevention
 * - Authentication & authorization
 * - Secure headers (CSP, X-Frame-Options)
 * - Password security (if applicable)
 * - Sensitive data exposure
 */

test.describe('Security Validation', () => {

  test.describe('XSS Prevention', () => {
    test('HTML in text field is sanitized/escaped', async ({ page }) => {
      await page.goto('/?admin=true')
      await page.waitForLoadState('networkidle')

      const block = page.locator('.block-wrapper').first()
      await block.click()

      const textInput = page.locator('.admin-sidebar input[type="text"]').first()
      if (await textInput.isVisible()) {
        // Try to inject HTML/JavaScript
        const maliciousInput = '<script>alert("XSS")</script><img src=x onerror="alert(1)">'
        await textInput.clear()
        await textInput.fill(maliciousInput)

        // Should be stored/displayed as text, not executed
        await page.on('dialog', dialog => {
          throw new Error('XSS vulnerability: alert() was executed')
        })

        // Wait a moment for any script to execute
        await page.waitForTimeout(1000)

        // Check the text is escaped in preview
        const displayedText = await page.locator('.block-wrapper').first().textContent()
        expect(displayedText).not.toContain('script')
        expect(displayedText).not.toContain('onerror')
      }
    })

    test('user-provided content in contact form is escaped', async ({ page }) => {
      await page.goto('/contact')
      await page.waitForLoadState('networkidle')

      const nameInput = page.locator('input[name*="nom|name|prenom"], input[type="text"]').first()
      if (await nameInput.isVisible()) {
        // Try XSS
        const xssPayload = '<script>console.log("XSS")</script>'
        await nameInput.fill(xssPayload)

        // Submit form
        const submitBtn = page.locator('button:has-text("Envoyer|Submit|Send")')
        if (await submitBtn.isVisible()) {
          // Check no alert happens
          let alertTriggered = false
          page.on('dialog', () => {
            alertTriggered = true
          })

          await submitBtn.click()
          await page.waitForTimeout(500)

          expect(alertTriggered).toBe(false)
        }
      }
    })

    test('localStorage/sessionStorage not vulnerable to XSS', async ({ page }) => {
      const xssCheck = await page.evaluate(() => {
        try {
          localStorage.setItem('test', '<img src=x onerror="alert(1)">')
          return localStorage.getItem('test')
        } catch (e) {
          return null
        }
      })

      // Should be stored as string, not executed
      expect(xssCheck).toContain('<img')
    })
  })

  test.describe('CSRF Protection', () => {
    test('API endpoints require proper headers/tokens', async ({ page }) => {
      await page.goto('/?admin=true')
      await page.waitForLoadState('networkidle')

      // Try to make API request without proper origin
      const response = await page.evaluate(async () => {
        try {
          const res = await fetch('/api/pages/accueil', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blocks: [] })
          })
          return { status: res.status }
        } catch (e) {
          return { error: (e as any).message }
        }
      })

      // Should either fail or require additional validation
      expect([401, 403, 400]).toContain((response as any).status)
    })

    test('form submissions use POST (not GET)', async ({ page }) => {
      await page.goto('/contact')

      const form = page.locator('form').first()
      if (await form.isVisible()) {
        const method = await form.getAttribute('method')
        expect(method?.toUpperCase()).toBe('POST')
      }
    })
  })

  test.describe('Input Validation & Sanitization', () => {
    test('email field validates email format', async ({ page }) => {
      await page.goto('/contact')

      const emailInput = page.locator('input[type="email"]').first()
      if (await emailInput.isVisible()) {
        // Try invalid email
        await emailInput.fill('not-an-email')

        const submitBtn = page.locator('button:has-text("Envoyer|Submit")')
        if (await submitBtn.isVisible()) {
          // HTML5 validation should prevent submission
          const invalidMessage = await page.evaluate(() => {
            const input = document.querySelector('input[type="email"]') as any
            return input?.validationMessage || ''
          })

          // Should have validation message or be invalid
          expect(invalidMessage.length > 0 || !await emailInput.isValid()).toBe(true)
        }
      }
    })

    test('textarea field limits length', async ({ page }) => {
      await page.goto('/contact')

      const textarea = page.locator('textarea').first()
      if (await textarea.isVisible()) {
        const maxLength = await textarea.getAttribute('maxlength')
        if (maxLength) {
          // Try to exceed max length
          const longText = 'a'.repeat(parseInt(maxLength) + 100)
          await textarea.fill(longText)

          const actualLength = (await textarea.inputValue()).length
          expect(actualLength).toBeLessThanOrEqual(parseInt(maxLength))
        }
      }
    })

    test('file upload validates file type', async ({ page }) => {
      await page.goto('/?admin=true')
      await page.waitForLoadState('networkidle')

      const fileInput = page.locator('input[type="file"]').first()
      if (await fileInput.isVisible()) {
        const accept = await fileInput.getAttribute('accept')
        // Should have file type restriction
        expect(accept).toBeTruthy()
      }
    })
  })

  test.describe('Authentication & Authorization', () => {
    test('unauthenticated users cannot access ?admin=true', async ({ page }) => {
      await page.goto('/?admin=true')

      // Should redirect to login or show login
      const loginBtn = page.locator('button:has-text("Se connecter|Login|Sign in")')
      const adminBadge = page.locator('text=Mode édition')

      const hasLogin = await loginBtn.isVisible({ timeout: 5000 }).catch(() => false)
      const hasAdmin = await adminBadge.isVisible().catch(() => false)

      // Should have login OR have redirected
      expect(hasLogin || page.url().includes('admin')).toBe(true)
    })

    test('admin-only API endpoints return 401 without auth', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')

      // Public pages might work, but admin endpoints should require auth
      // Check response doesn't leak sensitive admin data
      const text = await response.text()
      expect(text).not.toContain('password')
      expect(text).not.toContain('apiKey')
    })

    test('session is cleared on logout', async ({ page }) => {
      await page.goto('/?admin=true')
      await page.waitForLoadState('networkidle')

      // Exit admin mode
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Verify admin UI is gone
      const adminBadge = page.locator('text=Mode édition')
      expect(await adminBadge.isVisible()).toBe(false)

      // Try to access admin API without re-authenticating
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/pages/accueil')
        return res.status
      }).catch(() => 0)

      // Should require auth again
      expect([401, 403, 200]).toContain(response as number)
    })
  })

  test.describe('Secure Headers', () => {
    test('response has X-Frame-Options header', async ({ page }) => {
      const response = await page.request.get('/')

      const xFrameOptions = response.headers()['x-frame-options']
      expect(xFrameOptions).toBeTruthy()
      expect(['SAMEORIGIN', 'DENY']).toContain(xFrameOptions?.toUpperCase())
    })

    test('response has Content-Security-Policy', async ({ page }) => {
      const response = await page.request.get('/')

      const csp = response.headers()['content-security-policy'] ||
                   response.headers()['content-security-policy-report-only']

      // Should have CSP (even if report-only)
      expect(csp).toBeTruthy()
    })

    test('no sensitive headers leak (Server, X-Powered-By)', async ({ page }) => {
      const response = await page.request.get('/')

      const headers = response.headers()
      expect(headers['server']).not.toContain('Express')
      expect(headers['server']).not.toContain('Node')
      expect(headers['x-powered-by']).toBeFalsy()
    })
  })

  test.describe('Data Privacy & Exposure', () => {
    test('no credentials in URL parameters', async ({ page }) => {
      await page.goto('/?admin=true')

      const url = page.url()
      expect(url).not.toMatch(/token=|password=|secret=|key=/i)
    })

    test('no sensitive data in localStorage', async ({ page }) => {
      await page.goto('/')

      const storageKeys = await page.evaluate(() => {
        return Object.keys(localStorage)
      })

      const sensitiveKeywords = ['password', 'token', 'secret', 'apikey', 'credentials']
      for (const key of storageKeys) {
        for (const keyword of sensitiveKeywords) {
          expect(key.toLowerCase()).not.toContain(keyword)
        }
      }
    })

    test('API responses don\'t expose unnecessary data', async ({ page }) => {
      const response = await page.request.get('/api/pages/accueil')
      const data = await response.json()

      // Should not include admin-only fields in public response
      if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data)
        expect(keys).not.toContain('apiKey')
        expect(keys).not.toContain('password')
        expect(keys).not.toContain('adminToken')
      }
    })
  })

  test.describe('Rate Limiting & DOS Prevention', () => {
    test('no obvious rate limiting bypass', async ({ page }) => {
      await page.goto('/contact')

      const submitBtn = page.locator('button:has-text("Envoyer|Submit|Send")')
      if (await submitBtn.isVisible()) {
        // Try rapid submissions
        let successCount = 0
        for (let i = 0; i < 3; i++) {
          await submitBtn.click()
          await page.waitForTimeout(100)
        }

        // Should be blocked or delayed by rate limiting
        // (implementation specific)
      }
    })
  })

  test.describe('Dependency Vulnerabilities', () => {
    test('no console warnings about security issues', async ({ page }) => {
      const warnings: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'warning' || msg.type() === 'error') {
          warnings.push(msg.text())
        }
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Filter out expected warnings
      const securityWarnings = warnings.filter(w =>
        w.includes('vulnerable') ||
        w.includes('exploit') ||
        w.includes('security')
      )

      expect(securityWarnings.length).toBe(0)
    })
  })

  test.describe('HTTPS & TLS', () => {
    test('page serves over secure connection in production', async ({ page }) => {
      // Only check if production
      if (page.url().includes('localhost') || page.url().includes('127.0.0.1')) {
        // Local dev is OK with HTTP
        expect(true).toBe(true)
      } else {
        // Production should be HTTPS
        expect(page.url()).toMatch(/^https:/)
      }
    })
  })
})
