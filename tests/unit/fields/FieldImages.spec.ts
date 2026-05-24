import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldImages.vue (static/unit checks)', () => {

  const file = resolve(__dirname, '../../../components/editor/fields/FieldImages.vue')
  const src = readFileSync(file, 'utf-8')

  test('contains input for image URL and could support file input (type=file)', () => {
    // component uses a text input for URLs; ensure presence
    expect(src).toContain('type="text"')
    // Accept either file input or text input implementations
    const hasFile = /type=\"file\"/.test(src)
    const hasText = /type=\"text\"/.test(src)
    expect(hasFile || hasText).toBe(true)
  })

  test('contains a v-for to render existing images and uses a stable key', () => {
    expect(src).toContain('v-for="(url, idx) in localItems"')
    // key pattern: :key="idx + '-' + (url || '')"
    expect(src).toContain(":key=\"idx + '-' + (url || '')\"")
    expect(src).toContain('class="field-image-preview"')
  })

  test('contains controls to remove images and an add button, and emits change via emit', () => {
    expect(src).toContain('class="array-item-del"')
    expect(src).toContain('class="array-add-btn"')
    expect(src).toContain('removeItem(')
    expect(src).toContain("emit('change'")
  })

  test('accessibility: includes aria-labels for controls or visible text', () => {
    expect(src).toContain('aria-label')
    expect(src).toContain('array-item-num')
  })

})
