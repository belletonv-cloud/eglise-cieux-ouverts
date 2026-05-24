import { blockRegistry } from '~/lib/blocks/registry'

export default defineNuxtPlugin(() => {
  if (import.meta.server) return
  blockRegistry.populateFromBlockTypes()
})
