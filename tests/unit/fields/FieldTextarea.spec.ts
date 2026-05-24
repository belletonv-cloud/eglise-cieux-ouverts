import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldTextarea.vue (static/unit checks)', () => {

  const file = resolve(__dirname, '../../../components/editor/fields/FieldTextarea.vue')
  const src = readFileSync(file, 'utf-8')

  test('uses a textarea bound to :value and emits change on input', () => {
    expect(src).toContain('<textarea')
    expect(src).toContain(':value="value"')
    expect(src).toContain("@input=\"$emit('change', ($event.target as HTMLTextAreaElement).value)\"")
  })

  test('respects rows attribute and allows other configurable attributes', () => {
    expect(src).toContain('rows="4"')
    // component exposes placeholder, asserting presence
    expect(src).toContain(':placeholder="field.placeholder || \'\'"')
  })

  test('accessibility: component renders placeholder/label hooks for labelling', () => {
    // Static check ensures placeholder binding exists so consumers can provide accessible labeling
    expect(src).toContain('field.placeholder')
  })

})
