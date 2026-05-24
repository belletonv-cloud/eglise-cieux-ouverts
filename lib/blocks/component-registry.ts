/**
 * Central registry for block component names, CSS selectors, and dynamic imports.
 * Eliminates the 5 hardcoded maps that previously had to be manually kept in sync.
 */

function pascalCase(type: string): string {
  return type.replace(/-./g, s => s[1].toUpperCase()).replace(/^[a-z]/, s => s.toUpperCase())
}

function kebabCase(type: string): string {
  return type.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

export function getBlockComponentName(type: string): string {
  return `Block${pascalCase(type)}`
}

export function getBlockComponentPath(type: string): string {
  return `~/components/blocks/Block${pascalCase(type)}.vue`
}

export function getBlockCssSelector(type: string): string {
  const map: Record<string, string> = {
    hero: 'block-main-hero',
    aspirations: 'aspirations-viewport',
    vision: 'vision-section',
  }
  return map[type] || `block-${kebabCase(type)}`
}

import BlockHero from '~/components/blocks/BlockHero.vue'
import BlockBienvenue from '~/components/blocks/BlockBienvenue.vue'
import BlockActivities from '~/components/blocks/BlockActivities.vue'
import BlockTextImage from '~/components/blocks/BlockTextImage.vue'
import BlockRejoins from '~/components/blocks/BlockRejoins.vue'
import BlockAspirations from '~/components/blocks/BlockAspirations.vue'
import BlockContact from '~/components/blocks/BlockContact.vue'
import BlockNousRejoindre from '~/components/blocks/BlockNousRejoindre.vue'
import BlockRichText from '~/components/blocks/BlockRichText.vue'
import BlockGallery from '~/components/blocks/BlockGallery.vue'
import BlockSpacer from '~/components/blocks/BlockSpacer.vue'
import BlockFullWidthImage from '~/components/blocks/BlockFullWidthImage.vue'
import BlockVision from '~/components/blocks/BlockVision.vue'

export const BLOCK_MAP = {
  hero: BlockHero,
  bienvenue: BlockBienvenue,
  activities: BlockActivities,
  textImage: BlockTextImage,
  rejoins: BlockRejoins,
  aspirations: BlockAspirations,
  contact: BlockContact,
  nousRejoindre: BlockNousRejoindre,
  richText: BlockRichText,
  gallery: BlockGallery,
  spacer: BlockSpacer,
  fullWidthImage: BlockFullWidthImage,
  vision: BlockVision,
}

export function getBlockTypes(): string[] {
  return Object.keys(BLOCK_MAP)
}

export function resolveBlockComponent(type: string) {
  return BLOCK_MAP[type] || BLOCK_MAP.richText
}
