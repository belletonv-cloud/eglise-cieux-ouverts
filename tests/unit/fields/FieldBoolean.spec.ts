import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldBoolean.vue (static/unit checks)', () => {

  const file = resolve(__dirname, '../../../components/editor/fields/FieldBoolean.vue')
  const src = readFileSync(file, 'utf-8')

  test('uses an input type="checkbox" and binds :checked', () => {
    expect(src).toContain('type="checkbox"')
    expect(src).toContain(':checked="!!value"')
  })

  test('emits change on input and uses aria-label for accessibility', () => {
    expect(src).toContain("@change=\"$emit('change', ($event.target as HTMLInputElement).checked)\"")
    // should include an aria-label or similar
    expect(src).toMatch(/aria-label=\".*field.label.*\"|aria-label=\".*Toggle/) 
  })

})
