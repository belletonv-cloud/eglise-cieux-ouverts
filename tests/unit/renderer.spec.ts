import { test, expect } from '@playwright/test'
import {
  normalizeBlock,
  getAnimClass,
  filterByVisibility,
  shouldUseTrigger,
} from '../../lib/blocks/renderer'
import { BLOCK_TYPES } from '../../utils/blockTypes.js'

test.describe('lib/blocks/renderer (unit)', () => {

  test('normalizeBlock: returns null when given null', () => {
    // @ts-ignore
    expect(normalizeBlock(null)).toBeNull()
  })

  test('normalizeBlock: merges defaults, accepts nested props and strips empty values', () => {
    const raw = {
      id: 't1',
      type: 'bienvenue',
      props: {
        props: {
          title: 'Custom Title',
          animation: '', // should be stripped
          subtitle: null, // stripped
          fontSize: 8,
        }
      }
    }

    const norm = normalizeBlock(raw as any)
    // defaults should be present
    expect(norm.props).toBeDefined()
    // custom title should override default
    expect(norm.props.title).toBe('Custom Title')
    // animation was empty so fallback to default from BLOCK_TYPES
    expect(norm.props.animation).toBe(BLOCK_TYPES.bienvenue.defaults.animation)
    // fontSize preserved
    expect(norm.props.fontSize).toBe(8)
    // stripped fields should not be empty strings
    expect(norm.props.subtitle).toBeDefined()
  })

  test('getAnimClass: returns wrapper class for wrapper-strategy blocks and empty for internal/none', () => {
    const wrapperBlock = { type: 'bienvenue', props: { animation: 'portal' } } as any
    const cls = getAnimClass(wrapperBlock)
    expect(cls).toBeTruthy()
    expect(cls).toContain('block-')

    const internalBlock = { type: 'aspirations', props: { animation: 'zoom' } } as any
    // aspirations uses animations: 'internal' in BLOCK_TYPES
    expect(shouldUseTrigger(internalBlock)).toBe(false)
    expect(getAnimClass(internalBlock)).toBe('')

    const noneBlock = { type: 'spacer', props: { animation: 'none' } } as any
    expect(getAnimClass(noneBlock)).toBe('')
  })

  test('filterByVisibility: filters blocks per device correctly', () => {
    const blocks = [
      { id: 'a', visibility: { desktop: true, tablet: false, mobile: true } },
      { id: 'b', visibility: { desktop: false, tablet: true, mobile: true } },
      { id: 'c', visibility: {} },
    ] as any

    const desk = filterByVisibility(blocks, 'desktop')
    expect(desk.map(b => b.id)).toEqual(['a', 'c'])

    const tab = filterByVisibility(blocks, 'tablet')
    expect(tab.map(b => b.id)).toEqual(['b', 'c'])

    const mob = filterByVisibility(blocks, 'mobile')
    expect(mob.map(b => b.id)).toEqual(['a', 'b', 'c'])
  })

})
