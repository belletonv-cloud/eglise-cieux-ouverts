import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldText.vue (static/unit checks)', () => {

  const file = resolve(__dirname, '../../../components/editor/fields/FieldText.vue')
  const src = readFileSync(file, 'utf-8')

  test('template binds :value to value (displays initial value)', () => {
    expect(src).toContain(':value="value"')
  })

  test('template emits change on input (update event)', () => {
    expect(src).toContain("@input=\"$emit('change'")
  })

  test('script defines props and emits and does not coerce empty values', () => {
    // basic checks that props and emits are defined in the script setup
    expect(src).toMatch(/defineProps\s*<\{\s*value:/)
    expect(src).toMatch(/defineEmits\s*<\{\s*change:/)
    // ensure there is no explicit coercion like "|| ''" on the value prop in template
    expect(src).not.toMatch(/:value=\"value \|\|/) 
  })

})
