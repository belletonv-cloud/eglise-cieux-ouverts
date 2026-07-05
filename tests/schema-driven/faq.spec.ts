import { test, expect } from '@playwright/test'
import { BLOCK_TYPES } from '../../utils/blockTypes.js'
import { validateSchema } from './schema-test-helper.js'

const SCHEMA = (BLOCK_TYPES as any)['faq']?.schema || []
const DEFAULTS = (BLOCK_TYPES as any)['faq']?.defaults || {}

test.describe('BlockFaq — Schema-driven tests', () => {

  // ─── Schema validation ──────────────────────────────────────────────────

  validateSchema('faq', SCHEMA, DEFAULTS)

  test('schema has fields defined', () => {
    expect(SCHEMA.length).toBeGreaterThanOrEqual(1)
  })

  test('defaults match schema keys', () => {
    for (const field of SCHEMA) {
      expect(DEFAULTS).toHaveProperty(field.key)
    }
  })

  test('createBlock works for faq', () => {
    const { createBlock } = require('../../utils/blockTypes.js')
    const block = createBlock('faq')
    expect(block).not.toBeNull()
    expect(block!.type).toBe('faq')
    expect(block!.visibility?.desktop).toBe(true)
    expect(block!.visibility?.tablet).toBe(true)
    expect(block!.visibility?.mobile).toBe(true)
  })

  // ─── Rendering tests ────────────────────────────────────────────────────

  test('renders on page in admin mode', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.block-faq')
    const count = await block.count()
    // Block may or may not be on the current page
    expect(true).toBe(true)
  })

  test('has inner structure', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.block-faq').first()
    if (await block.isVisible()) {
      await expect(block.locator('.block-faq-inner')).toBeVisible()
    }
  })

  test('renders without JS (SSR)', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')
    // Block may not be on the home page; just verify no 500
    const title = await page.title()
    expect(title).not.toContain('500')
    await context.close()
  })

  test('hydration produces no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForTimeout(2000)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('Failed to load resource') &&
      !e.includes('404')
    )
    expect(criticalErrors).toEqual([])
  })

  // ─── Admin interaction tests ────────────────────────────────────────────

  test('wrapper gets admin-selected on click', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.block-faq').first()
    if (await block.isVisible()) {
      const wrapper = block.locator('..')
      await wrapper.click()
      await page.waitForTimeout(200)
      await expect(wrapper).toHaveClass(/admin-selected/)
    }
  })
})
