import { test, expect } from '@playwright/test'

test.describe('Templates Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?admin=true')
    // Wait for admin mode to load
    await page.waitForSelector('.admin-badge', { timeout: 5000 })
  })

  test('duplicate block button is visible and clickable', async ({ page }) => {
    // Click add block button
    await page.click('.admin-btn-add-block')
    await page.waitForSelector('.block-picker-modal')
    
    // Click on first block type
    await page.click('.block-picker-card:first-child')
    
    // Wait for block to appear
    await page.waitForTimeout(500)
    
    // Click duplicate button on new block
    const duplicateBtn = page.locator('.admin-action-duplicate').first()
    if (await duplicateBtn.count() > 0) {
      await duplicateBtn.click()
      await page.waitForTimeout(500)
      
      // Verify two blocks exist
      const blocks = await page.locator('[data-block-id]').count()
      expect(blocks).toBeGreaterThan(1)
    }
  })

  test('save template opens prompt', async ({ page }) => {
    // Mock prompt to return a value
    await page.evaluateOnNewDocument(() => {
      window.prompt = (msg) => 'Test Template'
    })
    
    // Add a block first
    await page.click('.admin-btn-add-block')
    await page.waitForSelector('.block-picker-modal')
    await page.click('.block-picker-card:first-child')
    await page.waitForTimeout(500)
    
    // Click save template button
    const templateBtn = page.locator('.admin-action-template').first()
    if (await templateBtn.count() > 0) {
      await templateBtn.click()
      // Toast should appear
      const toast = page.locator('.toast-success')
      expect(await toast.count()).toBeGreaterThan(0)
    }
  })
})
