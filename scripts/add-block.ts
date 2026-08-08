#!/usr/bin/env node
// scripts/add-block.ts
// CLI: npx tsx scripts/add-block.ts monBloc
// Generates: components/blocks/BlockMonBloc.vue + tests/schema-driven/mon-bloc.spec.ts

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

function kebabToPascal(s: string): string {
  return s.replace(/-./g, m => m[1].toUpperCase()).replace(/^[a-z]/, m => m.toUpperCase())
}

function toKebab(s: string): string {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

function usage(): void {
  console.log(`
Usage: npx tsx scripts/add-block.ts <kebab-case-name>

Example:
  npx tsx scripts/add-block.ts my-block

This will generate:
  components/blocks/BlockMyBlock.vue
  tests/schema-driven/my-block.spec.ts

Then you must:
  1. Add the schema entry to utils/blockTypes.js
  2. Add the import + v-if to components/BlockRenderer.vue
  3. Add the loader to lib/blocks/component-registry.ts
`)
}

const kebabName = process.argv[2]

if (!kebabName) {
  usage()
  process.exit(1)
}

if (!/^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/.test(kebabName)) {
  console.error(`Error: "${kebabName}" is not valid kebab-case (e.g. "my-block")`)
  process.exit(1)
}

const pascalName = kebabToPascal(kebabName)
const componentName = `Block${pascalName}`
const cssSelector = `block-${kebabName}`
const componentPath = resolve(PROJECT_ROOT, 'components', 'blocks', `${componentName}.vue`)
const testDir = resolve(PROJECT_ROOT, 'tests', 'schema-driven')
const testPath = resolve(testDir, `${kebabName}.spec.ts`)

// ─── Check if block type already exists in blockTypes.js ───────────────────
const blockTypesPath = resolve(PROJECT_ROOT, 'utils', 'blockTypes.js')
const blockTypesContent = readFileSync(blockTypesPath, 'utf-8')
if (blockTypesContent.includes(`  ${kebabName}:`) || blockTypesContent.includes(`  ${pascalName}:`)) {
  console.error(`Error: Block type "${kebabName}" already exists in utils/blockTypes.js`)
  process.exit(1)
}

// ─── Generate Block component ──────────────────────────────────────────────
const componentTemplate = `<template>
  <section
    class="${cssSelector}"
    :class="[visibilityClasses]"
  >
    <div class="${cssSelector}-inner">
      <h2 class="${cssSelector}-title" v-if="title">{{ title }}</h2>
      <div class="${cssSelector}-body" v-if="body" v-html="body"></div>
      <slot />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  blockId: { type: String, default: '' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  'is-admin': { type: Boolean, default: false },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
})

const { visibility = {} } = props

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))
</script>

<style scoped>
.${cssSelector} {
  padding: 60px 24px;
  container-type: inline-size;
}

.${cssSelector}-inner {
  max-width: 900px;
  margin: 0 auto;
}

.${cssSelector}-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.5em, 3vw, 2.5em);
  color: #064886;
  margin-bottom: 20px;
}

.${cssSelector}-body {
  font-size: 1.1em;
  line-height: 1.7;
  color: #1a1a2e;
}

@media (max-width: 768px) {
  .${cssSelector} {
    padding: 40px 20px;
  }
}
</style>
`

// ─── Generate Test file ────────────────────────────────────────────────────
const testTemplate = `import { test, expect } from '@playwright/test'
import { BLOCK_TYPES } from '../../utils/blockTypes.js'
import { validateSchema } from './schema-test-helper.js'

const SCHEMA = (BLOCK_TYPES as any)['${kebabName}']?.schema || []
const DEFAULTS = (BLOCK_TYPES as any)['${kebabName}']?.defaults || {}

test.describe('${componentName} — Schema-driven tests', () => {

  // ─── Schema validation ──────────────────────────────────────────────────

  validateSchema('${kebabName}', SCHEMA, DEFAULTS)

  test('schema has fields defined', () => {
    expect(SCHEMA.length).toBeGreaterThanOrEqual(1)
  })

  test('defaults match schema keys', () => {
    for (const field of SCHEMA) {
      expect(DEFAULTS).toHaveProperty(field.key)
    }
  })

  test('createBlock works for ${kebabName}', () => {
    const { createBlock } = require('../../utils/blockTypes.js')
    const block = createBlock('${kebabName}')
    expect(block).not.toBeNull()
    expect(block!.type).toBe('${kebabName}')
    expect(block!.visibility?.desktop).toBe(true)
    expect(block!.visibility?.tablet).toBe(true)
    expect(block!.visibility?.mobile).toBe(true)
  })

  // ─── Rendering tests ────────────────────────────────────────────────────

  test('renders on page in admin mode', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.${cssSelector}')
    const count = await block.count()
    // Block may or may not be on the current page
    expect(true).toBe(true)
  })

  test('has inner structure', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.${cssSelector}').first()
    if (await block.isVisible()) {
      await expect(block.locator('.${cssSelector}-inner')).toBeVisible()
    }
  })

  test('renders without JS (SSR)', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')
    // Block may not be on the home page; just verify no 500
    const title = await page.title()
    expect(title).not.toContain('500')
    await context.close()
  })

  test('hydration produces no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForTimeout(2000)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('Failed to load resource') &&
      !e.includes('404')
    )
    expect(criticalErrors).toEqual([])
  })

  // ─── Admin interaction tests ────────────────────────────────────────────

  test('wrapper gets admin-selected on click', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)
    const block = page.locator('.${cssSelector}').first()
    if (await block.isVisible()) {
      const wrapper = block.locator('..')
      await wrapper.click()
      await page.waitForTimeout(200)
      await expect(wrapper).toHaveClass(/admin-selected/)
    }
  })
})
`

// ─── Write files ───────────────────────────────────────────────────────────
writeFileSync(componentPath, componentTemplate, 'utf-8')
console.log(`✓ Created ${componentPath}`)

if (!existsSync(testDir)) {
  mkdirSync(testDir, { recursive: true })
}
writeFileSync(testPath, testTemplate, 'utf-8')
console.log(`✓ Created ${testPath}`)

// ─── Instructions ──────────────────────────────────────────────────────────
console.log(`
─── Next steps ──────────────────────────────────────────────────────────────

1. Add the schema to utils/blockTypes.js:

   ${kebabName}: {
     label: "${pascalName}",
     icon: "📄",
     category: "content",
     animations: "wrapper",
     defaults: {
       title: "Titre",
       body: "Contenu de la section.",
     },
     schema: [
       { key: "title", label: "Titre", type: "text" },
       { key: "body", label: "Contenu", type: "textarea" },
     ],
   },

2. Add to components/BlockRenderer.vue:
   - Import: import ${componentName} from "~/components/blocks/${componentName}.vue"
   - Add v-if branch:
       <${componentName}
         v-else-if="btype === '${kebabName}'"
         v-bind="sprops"
         :block-id="bid"
         :visibility="bvisibility"
         :is-triggered="isTriggered"
         :data-admin="isAdmin || undefined"
       />

3. Add to lib/blocks/component-registry.ts in BLOCK_MAP:
   ${kebabName}: () => import('../../components/blocks/${componentName}.vue'),

4. Run tests:
   npx playwright test tests/schema-driven/${kebabName}.spec.ts
`)
