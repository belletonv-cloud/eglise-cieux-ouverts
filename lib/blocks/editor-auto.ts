import type { FieldSchema, BlockInstance } from './types'
import { BLOCK_TYPES } from '~/utils/blockTypes.js'

export function getFieldComponent(type: string): string {
  const map: Record<string, string> = {
    text: 'FieldText',
    textarea: 'FieldTextarea',
    richtext: 'FieldRichText',
    number: 'FieldNumber',
    color: 'FieldColor',
    boolean: 'FieldBoolean',
    select: 'FieldSelect',
    animation: 'FieldAnimation',
    image: 'FieldImage',
    array: 'FieldArray',
    images: 'FieldImages',
  }
  return map[type] || 'FieldText'
}

export function getBlockLabel(type: string): string {
  return BLOCK_TYPES[type]?.label || type
}

export function getBlockSchema(type: string): FieldSchema[] {
  return BLOCK_TYPES[type]?.schema || []
}

export function getBlockDefaults(type: string): Record<string, any> {
  return BLOCK_TYPES[type]?.defaults || {}
}

export function getPropValue(block: BlockInstance | null, key: string): any {
  if (!block) return ''
  return block.props?.[key] ?? ''
}

export function createUpdatedBlock(block: BlockInstance, key: string, value: any): BlockInstance {
  return {
    ...block,
    props: { ...block.props, [key]: value },
  }
}
