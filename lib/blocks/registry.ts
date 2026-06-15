import type { BlockSchema, BlockCategory, ValidationError, AnimationStrategy } from './types'
import { validateBlockSchema, type FieldSchema } from './types'
import { BLOCK_TYPES } from '~/utils/blockTypes.js'
import { getBlockComponentName, resolveBlockComponent } from './component-registry'

export interface RegistryEntry extends BlockSchema {
  loader: () => Promise<any>
  componentCache?: any
}

type RegisterOptions = {
  validate?: boolean
  category?: BlockCategory
  animations?: AnimationStrategy
}

class BlockRegistry {
  private entries = new Map<string, RegistryEntry>()
  private errors: ValidationError[] = []

  register(type: string, schema: Omit<BlockSchema, 'type'>, loader: () => Promise<any>, options?: RegisterOptions): RegistryEntry {
    if (this.entries.has(type)) {
      console.warn(`[BlockRegistry] Duplicate block type: ${type}, overwriting`)
    }

    const fullSchema: BlockSchema = {
      type,
      ...schema,
      animations: options?.animations ?? schema.animations ?? 'wrapper',
      category: options?.category ?? schema.category ?? 'content',
    }

    if (options?.validate !== false) {
      const schemaErrors = validateBlockSchema(fullSchema)
      if (schemaErrors.length > 0) {
        this.errors.push(...schemaErrors)
        console.error(`[BlockRegistry] Schema validation failed for "${type}":`, schemaErrors)
      }
    }

    const entry: RegistryEntry = { ...fullSchema, loader }
    this.entries.set(type, entry)
    return entry
  }

  registerFromSchema(schema: BlockSchema, loader: () => Promise<any>): RegistryEntry {
    return this.register(schema.type, schema, loader, { validate: true })
  }

  get(type: string): RegistryEntry | undefined {
    return this.entries.get(type)
  }

  getAll(): RegistryEntry[] {
    return Array.from(this.entries.values())
  }

  getByCategory(category: BlockCategory): RegistryEntry[] {
    return this.getAll().filter(b => b.category === category)
  }

  getTypes(): string[] {
    return Array.from(this.entries.keys())
  }

  getSchema(type: string) {
    return this.entries.get(type)?.schema ?? []
  }

  getDefaults(type: string) {
    return this.entries.get(type)?.defaults ?? {}
  }

  getAnimationStrategy(type: string): AnimationStrategy {
    return this.entries.get(type)?.animations ?? 'wrapper'
  }

  shouldUseWrapperAnimation(type: string): boolean {
    return this.getAnimationStrategy(type) === 'wrapper'
  }

  async loadComponent(type: string): Promise<any> {
    const entry = this.entries.get(type)
    if (!entry) {
      console.warn(`[BlockRegistry] Unknown block type: ${type}, cannot load component`)
      return null
    }
    if (entry.componentCache) return entry.componentCache
    try {
      entry.componentCache = await entry.loader()
      return entry.componentCache
    } catch (err) {
      console.error(`[BlockRegistry] Failed to load component for "${type}":`, err)
      return null
    }
  }

  getValidationErrors(): ValidationError[] {
    return [...this.errors]
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  clear() {
    this.entries.clear()
    this.errors = []
  }

  populateFromBlockTypes() {
    const errors: ValidationError[] = []
    for (const [type, def] of Object.entries(BLOCK_TYPES)) {
      const schema: BlockSchema = {
        type,
        label: def.label,
        icon: def.icon,
        category: def.category as BlockCategory,
        animations: def.animations as AnimationStrategy,
        defaults: def.defaults,
        schema: def.schema as FieldSchema[],
        component: getBlockComponentName(type),
      }
      const schemaErrors = validateBlockSchema(schema)
      if (schemaErrors.length > 0) {
        this.errors.push(...schemaErrors)
        errors.push(...schemaErrors)
      }
      const entry: RegistryEntry = {
        ...schema,
        // resolveBlockComponent returns a component (synchronous) from
        // our BLOCK_MAP. Keep the loader contract (returns a Promise)
        // for consumers that await component loading.
        loader: () => Promise.resolve(resolveBlockComponent(type)),
      }
      this.entries.set(type, entry)
    }
    if (errors.length > 0) {
      console.error(`[BlockRegistry] ${errors.length} schema validation error(s) during populate:`)
      for (const e of errors) {
        console.error(`  ${e.type}.${e.field}: ${e.message}`)
      }
    }
    console.log(`[BlockRegistry] Populated ${this.entries.size} block types`)
    return errors
  }
}

export const blockRegistry = new BlockRegistry()

export function defineBlock(
  type: string,
  schema: Omit<BlockSchema, 'type'>,
  loader: () => Promise<any>,
  options?: RegisterOptions
) {
  return blockRegistry.register(type, schema, loader, options)
}
