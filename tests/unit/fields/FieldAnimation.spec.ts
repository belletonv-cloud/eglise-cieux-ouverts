import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

test.describe('FieldAnimation.vue (static/unit checks)', () => {
  const file = resolve(__dirname, '../../../components/editor/fields/FieldAnimation.vue')
  const src = readFileSync(file, 'utf-8')

  test('uses either select/input/buttons and renders items via ANIMATIONS or field.options', () => {
    const hasSelect = /<select/.test(src)
    const hasInput = /<input/.test(src)
    const hasButtons = /<button/.test(src)
    const usesAnimations = /ANIMATIONS/.test(src)
    const usesFieldOptions = /field\.options/.test(src)

    expect(hasSelect || hasInput || hasButtons).toBe(true)
    expect(usesAnimations || usesFieldOptions).toBe(true)
  })

  test('binds to value in some form (either :value or comparison with value) and marks active state', () => {
    const bindsValue = /:value=\"value\"/.test(src)
    const comparesValue = /value ===/.test(src) || /value ==/.test(src)
    const hasActiveClass = /active: value ===/.test(src) || /:class=/.test(src)

    expect(bindsValue || comparesValue).toBe(true)
    expect(hasActiveClass).toBe(true)
  })

  test('emits change via $emit on @change, @input or @click', () => {
    const emitsOnChange = /@change=\"\$emit\('change'/.test(src)
    const emitsOnInput = /@input=\"\$emit\('change'/.test(src)
    const emitsOnClick = /@click=\"\$emit\('change'/.test(src)
    expect(emitsOnChange || emitsOnInput || emitsOnClick).toBe(true)
  })

  test('includes an accessibility attribute (aria-*, role or similar)', () => {
    const hasAria = /aria-\w+=\"/.test(src)
    const hasRole = /role=\"/.test(src)
    expect(hasAria || hasRole).toBe(true)
  })
})
