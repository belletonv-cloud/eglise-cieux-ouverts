import { test, expect } from '@playwright/test'
import { getFieldComponent, getBlockLabel, getPropValue, createUpdatedBlock } from '../../lib/blocks/editor-auto'
import { BLOCK_TYPES } from '../../utils/blockTypes.js'

test.describe('lib/blocks/editor-auto (unit)', () => {

  test('getFieldComponent returns correct component name and falls back to FieldText', () => {
    expect(getFieldComponent('text')).toBe('FieldText')
    expect(getFieldComponent('number')).toBe('FieldNumber')
    // unknown type falls back
    expect(getFieldComponent('unknown_type_xyz')).toBe('FieldText')
  })

  test('getBlockLabel returns label from BLOCK_TYPES or type as fallback', () => {
    expect(getBlockLabel('bienvenue')).toBe(BLOCK_TYPES.bienvenue.label)
    expect(getBlockLabel('nonexistent_block_type')).toBe('nonexistent_block_type')
  })

  test('getPropValue returns value or empty string if absent', () => {
    const block = { props: { title: 'Hello' } } as any
    expect(getPropValue(block, 'title')).toBe('Hello')
    expect(getPropValue(block, 'missing')).toBe('')
    expect(getPropValue(null, 'anything')).toBe('')
  })

  test('createUpdatedBlock returns a new block with updated prop while keeping others intact', () => {
    const block = { id: '1', type: 'textImage', props: { title: 'A', image: '/x' } } as any
    const updated = createUpdatedBlock(block, 'title', 'B')
    expect(updated.props.title).toBe('B')
    expect(updated.props.image).toBe('/x')
    // original should be unchanged
    expect(block.props.title).toBe('A')
  })

})
