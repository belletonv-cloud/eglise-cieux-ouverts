import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldImage.vue (static/unit checks)', () => {
  const file = resolve(__dirname, '../../../components/editor/fields/FieldImage.vue')
  const src = readFileSync(file, 'utf-8')

  test('renders an input bound to value prop', () => {
    expect(src).toContain('type="text"')
    expect(src).toContain(':value="value"')
  })

  test('emits change on input', () => {
    expect(src).toContain("@input=\"$emit('change'")
  })

  test('shows preview img when value is truthy', () => {
    expect(src).toContain('v-if="value"')
    expect(src).toContain(':src="value"')
    expect(src).toContain('class="field-image-preview"')
  })

  test('has a placeholder for image path', () => {
    expect(src).toContain('placeholder=')
  })

  test('defines props and emits in script setup', () => {
    expect(src).toMatch(/defineProps\s*<\{.*value.*field.*\}>/)
    expect(src).toMatch(/defineEmits\s*<\{.*change.*\}>/)
  })
})
