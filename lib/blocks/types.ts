export interface FieldSchema {
  key: string
  label: string
  type: FieldType
  min?: number
  max?: number
  step?: number
  options?: string[]
  placeholder?: string
  subFields?: FieldSchema[]
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'color'
  | 'boolean'
  | 'select'
  | 'animation'
  | 'image'
  | 'array'
  | 'images'

export type AnimationStrategy = 'wrapper' | 'internal' | 'none'

export interface BlockSchema {
  type: string
  label: string
  icon: string
  category: BlockCategory
  defaults: Record<string, any>
  schema: FieldSchema[]
  component: string
  adminComponent?: string
  adminRenderer?: string
  animations: AnimationStrategy
}

export type BlockCategory = 'content' | 'layout' | 'media' | 'hero'

export interface BlockInstance {
  id: string
  type: string
  props: Record<string, any>
  visibility: {
    desktop: boolean
    tablet: boolean
    mobile: boolean
  }
  // Per-device prop overrides merged on top of `props` at render time.
  // Desktop always uses the base `props`; tablet/mobile may override any key.
  responsive?: {
    tablet?: Record<string, any>
    mobile?: Record<string, any>
  }
}

export interface EditorFieldProps {
  label: string
  value: any
  field: FieldSchema
  onChange: (value: any) => void
}

export interface TestScenario {
  blockType: string
  label: string
  props: Record<string, any>
  assertions: Assertion[]
}

export interface Assertion {
  type: 'visible' | 'text' | 'css' | 'count' | 'attribute' | 'notVisible'
  selector: string
  value?: string
  count?: number
  attr?: string
}

const VALID_FIELD_TYPES: FieldType[] = [
  'text', 'textarea', 'richtext', 'number', 'color',
  'boolean', 'select', 'animation', 'image', 'array', 'images',
]

const VALID_CATEGORIES: BlockCategory[] = ['content', 'layout', 'media', 'hero']
const VALID_ANIMATION_STRATEGIES: AnimationStrategy[] = ['wrapper', 'internal', 'none']

export interface ValidationError {
  type: string
  field: string
  message: string
}

export function validateBlockSchema(schema: BlockSchema): ValidationError[] {
  const errors: ValidationError[] = []

  if (!schema.type) {
    errors.push({ type: schema.type, field: 'type', message: 'type is required' })
  }
  if (!schema.label) {
    errors.push({ type: schema.type, field: 'label', message: 'label is required' })
  }
  if (!schema.icon) {
    errors.push({ type: schema.type, field: 'icon', message: 'icon is required' })
  }
  if (!VALID_CATEGORIES.includes(schema.category)) {
    errors.push({ type: schema.type, field: 'category', message: `category must be one of: ${VALID_CATEGORIES.join(', ')}, got "${schema.category}"` })
  }
  if (!VALID_ANIMATION_STRATEGIES.includes(schema.animations)) {
    errors.push({ type: schema.type, field: 'animations', message: `animations must be one of: ${VALID_ANIMATION_STRATEGIES.join(', ')}, got "${schema.animations}"` })
  }

  const seenKeys = new Set<string>()
  for (const field of schema.schema) {
    if (!field.key) {
      errors.push({ type: schema.type, field: '(unnamed)', message: 'field key is required' })
      continue
    }
    if (seenKeys.has(field.key)) {
      errors.push({ type: schema.type, field: field.key, message: `duplicate field key: ${field.key}` })
    }
    seenKeys.add(field.key)

    if (!field.label) {
      errors.push({ type: schema.type, field: field.key, message: `field "${field.key}" has no label` })
    }
    if (!VALID_FIELD_TYPES.includes(field.type)) {
      errors.push({ type: schema.type, field: field.key, message: `invalid field type "${field.type}". Valid: ${VALID_FIELD_TYPES.join(', ')}` })
    }
    if (!(field.key in schema.defaults)) {
      errors.push({ type: schema.type, field: field.key, message: `field "${field.key}" has no default value in defaults` })
    }
    if (field.type === 'select' && (!field.options || field.options.length < 1)) {
      errors.push({ type: schema.type, field: field.key, message: `select field "${field.key}" needs at least 1 option` })
    }
    if (field.type === 'number' && (field.min === undefined || field.max === undefined)) {
      errors.push({ type: schema.type, field: field.key, message: `number field "${field.key}" needs min and max` })
    }
    if (schema.animations === 'none' && field.type === 'animation') {
      errors.push({ type: schema.type, field: field.key, message: `block with animations='none' cannot have animation field "${field.key}"` })
    }
  }

  return errors
}

export function ALL_VALID_FIELD_TYPES(): FieldType[] {
  return [...VALID_FIELD_TYPES]
}
