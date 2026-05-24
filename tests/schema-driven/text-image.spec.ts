import { test, expect } from '@playwright/test'
import { BLOCK_TYPES } from '../../utils/blockTypes.js'
import { validateSchema } from './schema-test-helper.js'

const TI_SCHEMA = (BLOCK_TYPES as any).textImage?.schema || []
const TI_DEFAULTS = (BLOCK_TYPES as any).textImage?.defaults || {}

test.describe('BlockTextImage — Schema-driven tests', () => {

  // ─── Schema validation ──────────────────────────────────────────────────

  validateSchema('textImage', TI_SCHEMA, TI_DEFAULTS)

  test('schema has correct field count', () => {
    expect(TI_SCHEMA.length).toBe(11)
  })

  test('select fields have options', () => {
    const visualStyle = TI_SCHEMA.find((f: any) => f.key === 'visualStyle')
    expect(visualStyle).toBeDefined()
    expect(visualStyle.options).toBeDefined()
    expect(visualStyle.options.length).toBeGreaterThanOrEqual(2)
  })

  test('animation defaults to slideLeft', () => {
    expect(TI_DEFAULTS.animation).toBe('slideLeft')
  })

  test('reverse defaults to false', () => {
    expect(TI_DEFAULTS.reverse).toBe(false)
  })

  test('createBlock works for textImage', () => {
    const { createBlock } = require('../../utils/blockTypes.js')
    const block = createBlock('textImage')
    expect(block).not.toBeNull()
    expect(block.type).toBe('textImage')
    expect(block.props?.animation).toBe('slideLeft')
  })

  // ─── Rendering tests ────────────────────────────────────────────────────

  test('renders on messages page', async ({ page }) => {
    await page.goto('/messages?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.block-textimage')
    await expect(block).toBeVisible({ timeout: 5000 })
  })

  test('has text content', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(2000)
    const block = page.locator('.block-textimage').first()
    await expect(block.locator('.ti-title')).toBeVisible()
    await expect(block.locator('.ti-body')).toBeVisible()
  })

  test('has image', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(2000)
    const img = page.locator('.block-textimage .ti-img').first()
    await expect(img).toBeVisible()
    const src = await img.getAttribute('src')
    expect(src).toBeTruthy()
  })

  test('renders with correct grid layout', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(2000)
    const block = page.locator('.block-textimage').first()
    const inner = block.locator('.ti-inner')
    await expect(inner).toBeVisible()
  })

  test('wrapper gets admin-selected on click', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.block-textimage').first()
    await expect(block).toBeVisible()
    const wrapper = block.locator('..')
    await wrapper.click()
    await page.waitForTimeout(200)
    await expect(wrapper).toHaveClass(/admin-selected/)
  })

  test('has CTA button when ctaText is set', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(2000)
    const cta = page.locator('.block-textimage .ti-cta')
    await expect(cta).toBeVisible()
    expect(await cta.textContent()).toBeTruthy()
  })

  test('laptop visual style renders correctly', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(2000)
    const laptop = page.locator('.ti-laptop-shell')
    await expect(laptop).toBeVisible()
    await expect(laptop.locator('.ti-laptop-screen-frame')).toBeVisible()
    await expect(laptop.locator('.ti-laptop-base')).toBeVisible()
  })

  test('renders without JS (SSR)', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/messages')
    await expect(page.locator('.block-textimage')).toBeVisible({ timeout: 10000 })
    await context.close()
  })

  // ─── Admin editor tests ─────────────────────────────────────────────────

  test('schema fields appear in admin sidebar AutoEditor', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.block-textimage').first()
    await block.locator('..').click()
    await page.waitForTimeout(300)
    for (const field of TI_SCHEMA.slice(0, 4)) {
      await expect(page.locator(`.admin-sidebar label:has-text("${field.label}")`).first()).toBeVisible()
    }
  })
})
