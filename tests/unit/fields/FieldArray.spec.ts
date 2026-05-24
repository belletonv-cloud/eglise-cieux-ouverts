import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldArray.vue (static/unit checks)', () => {

  const file = resolve(__dirname, '../../../components/editor/fields/FieldArray.vue')
  const src = readFileSync(file, 'utf-8')

  test('contains a v-for for localItems to render array elements', () => {
    expect(src).toContain('v-for="(item, idx) in localItems"')
    expect(src).toContain(':key="getItemKey(item, idx)"')
  })

  test('contains an add button with class array-add-btn and an aria-label', () => {
    expect(src).toContain('class="array-add-btn"')
    expect(src).toContain('aria-label')
    expect(src).toMatch(/\+ Ajouter|Add|\+\s*Ajouter/) 
  })

  test('contains a delete control for each item (array-item-del) and emits change via emit', () => {
    expect(src).toContain('class="array-item-del"')
    // ensure removeItem and emit('change' usage present
    expect(src).toContain('removeItem(')
    expect(src).toContain("emit('change'")
  })

  test('accessibility: includes aria-labels or visible text for controls', () => {
    expect(src).toContain('aria-label')
    expect(src).toContain('array-item-num')
  })

})
