import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldNumber.vue (static/unit checks)', () => {

  const file = resolve(__dirname, '../../../components/editor/fields/FieldNumber.vue')
  const src = readFileSync(file, 'utf-8')

  test('uses type="range" input and binds :value', () => {
    expect(src).toContain('type="range"')
    expect(src).toContain(':value="value"')
  })

  test('emits change event with Number coercion on input', () => {
    expect(src).toContain("@input=\"$emit('change', Number(($event.target as HTMLInputElement).value))\"")
  })

  test('binds min, max and step to field props', () => {
    expect(src).toContain(':min="field.min ?? 0"')
    expect(src).toContain(':max="field.max ?? 100"')
    expect(src).toContain(':step="field.step ?? 1"')
  })

})
