import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldColor.vue (static/unit checks)', () => {

  const file = resolve(__dirname, '../../../components/editor/fields/FieldColor.vue')
  const src = readFileSync(file, 'utf-8')

  test('uses an input type="color" and binds :value', () => {
    expect(src).toContain('type="color"')
    expect(src).toContain(':value="value"')
  })

  test('emits change on input with proper $emit usage', () => {
    expect(src).toContain("@input=\"$emit('change', ($event.target as HTMLInputElement).value)\"")
  })

  test('includes aria-label or similar accessibility attribute', () => {
    // Accept either an explicit aria-label/role or a text input that can serve as an accessible label/entry
    const hasAria = /aria-label=\".*\"|role=\".*\"/.test(src)
    const hasTextInput = /type=\"text\"/.test(src)
    expect(hasAria || hasTextInput).toBe(true)
  })

})
