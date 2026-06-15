import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldRichText.vue (static/unit checks)', () => {
  const file = resolve(__dirname, '../../../components/editor/fields/FieldRichText.vue')
  const src = readFileSync(file, 'utf-8')

  test('renders a textarea bound to value prop', () => {
    expect(src).toContain('<textarea')
    expect(src).toContain(':value="value"')
    expect(src).toContain('rows="6"')
  })

  test('emits change on input', () => {
    expect(src).toContain("@input=\"$emit('change'")
  })

  test('uses monospace font for richtext editing', () => {
    expect(src).toContain('monospace')
  })

  test('has vertical resize enabled', () => {
    expect(src).toContain('resize: vertical')
  })

  test('defines props and emits in script setup', () => {
    expect(src).toMatch(/defineProps\s*<\{.*value.*field.*\}>/)
    expect(src).toMatch(/defineEmits\s*<\{.*change.*\}>/)
  })
})
