<template>
  <div class="page-renderer" :class="{ 'admin-mode': isAdmin && isMounted }">
    <VueDraggable
      v-if="isMounted && isAdmin"
      v-model="sortableBlocks"
      :animation="200"
      handle=".drag-handle"
      :group="{ name: 'blocks' }"
      ghost-class="block-ghost"
      tag="div"
      class="drag-container"
      @change="onDragChange"
      item-key="id"
    >
      <template #item="{ element: block }">
        <div
          class="block-wrapper"
          :class="[getAnimClass(block), useTrigger(block) ? { triggered: isTriggered(block.id) } : '', { 'admin-selected': isSelected(block), 'draggable': isAdmin }]"
          :ref="el => setWrapperRef(el, block.id)"
          :data-block-id="block.id"
          :data-block-type="block.type"
          @click.capture="wrapperClick(block.id)"
        >
          <div v-if="isAdmin" class="drag-handle" @click.stop title="Déplacer">⠿</div>
          <Suspense>
            <template #default>
              <component
                :is="blockComponent(block.type)"
                v-bind="sanitizeProps(block.props, block.id)"
                :visibility="block.visibility"
                :is-triggered="useTrigger(block) ? isTriggered(block.id) : false"
                :block-id="block.id"
                @click.capture="wrapperClick(block.id)"
              />
            </template>
            <template #fallback></template>
          </Suspense>
        </div>
      </template>
    </VueDraggable>
    <template v-else>
      <div
        v-for="block in visibleBlocks"
        :key="block.id"
        class="block-wrapper"
        :class="[getAnimClass(block), useTrigger(block) ? { triggered: isTriggered(block.id) } : '', { 'admin-selected': isSelected(block) }]"
        :ref="el => setWrapperRef(el, block.id)"
        :data-block-id="block.id"
        :data-block-type="block.type"
        @click.capture="isAdmin && wrapperClick(block.id)"
      >
        <template v-if="isMounted">
          <Suspense>
            <template #default>
              <component
                :is="blockComponent(block.type)"
                v-bind="sanitizeProps(block.props, block.id)"
                :visibility="block.visibility"
                :is-triggered="useTrigger(block) ? isTriggered(block.id) : false"
                :block-id="block.id"
                @click.capture="wrapperClick(block.id)"
              />
            </template>
            <template #fallback></template>
          </Suspense>
        </template>
        <template v-else>
          <div class="block-server-placeholder" aria-hidden="true"></div>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, inject, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { normalizeBlock, getAnimClass, filterByVisibility, shouldUseTrigger } from '~/lib/blocks/renderer'
import { resolveBlockComponent } from '~/lib/blocks/component-registry'
import { useBlockAnimation } from '~/composables/useBlockAnimation'
import { useAdmin } from '~/composables/useAdmin'

  const isAdmin = inject('isAdmin', ref(false))
  const isEditor = inject('isEditor', ref(false))
  const editingBlockId = inject('editingBlockId', ref(null))
  const selectBlock = inject('selectBlock', () => {})
  // Provide a local, reactive reference to the composable's editing block id
  // so that watchers and logging see the up-to-date value during SSR/CSR
  // transitions. This mirrors the editingBlockId but avoids direct mutation.
const previewDevice = inject('previewDevice', ref('desktop'))

const props = defineProps({
  blocks: { type: Array, default: () => [] },
})

const { reorderBlocks } = useAdmin()

const sortableBlocks = computed({
  get: () => visibleBlocks.value,
  set: (val) => {
    if (isAdmin && isAdmin.value) {
      reorderBlocks(val)
    }
  }
})

function onDragChange() {
  if (editingBlockId && editingBlockId.value) {
    document.querySelectorAll('.admin-selected').forEach(el => el.classList.remove('admin-selected'))
  }
}

const {
  triggeredBlocks,
  isTriggered,
  setWrapperRef,
  setup,
  handleBlocksChange,
  handleAnimationChange,
} = useBlockAnimation(isAdmin)

  const isMounted = ref(false)
  const isServer = typeof window === 'undefined' || !import.meta?.client
  const adminModeActive = computed(() => Boolean(isAdmin && (isMounted.value || isServer)))

const useTrigger = shouldUseTrigger

const fixedBlocks = computed(() => {
  return (props.blocks || []).map(normalizeBlock)
})

const visibleBlocks = computed(() => {
  return filterByVisibility(fixedBlocks.value, previewDevice.value || 'desktop')
})

// Local reactive selected id (mirrors injected editingBlockId ref)
const selectedId = ref(null)
watch(editingBlockId, (v) => {
  selectedId.value = v
  try { console.warn('PageRenderer.selectedId changed', { selectedId: v }) } catch (e) {}
}, { immediate: true })

function blockComponent(type) {
  // Always return an async component wrapper. This ensures Suspense behaves
  // predictably and prevents Promise objects from leaking into the render
  // tree when a resolver returns a loader or a component directly.
  const loader = resolveBlockComponent(type)
  // Defensive normalization: resolveBlockComponent may return:
  // - a loader function () => import('...')
  // - a Promise resolving to a loader (older registry contract)
  // - a component object directly
  // Normalize to a factory that returns a Promise resolving to the component.
  if (loader && typeof loader.then === 'function') {
    // loader is already a Promise (resolve it to get the real loader/component)
    return defineAsyncComponent(() => loader.then(r => r?.default || r))
  }

  if (typeof loader === 'function') {
    // call the loader and normalize its result
    return defineAsyncComponent(() => Promise.resolve(loader()).then(r => r?.default || r))
  }

  // otherwise assume it's a component-like value
  return defineAsyncComponent(() => Promise.resolve(loader))
}

function sanitizeProps(obj, blockId = '') {
  // Deep-clone while replacing any thenable/promise with null.
  function clean(value, path = '') {
    if (value === null || value === undefined) return value
    if (typeof value !== 'object') return value
    // Detect thenable/promise-like objects
    if (typeof value.then === 'function') {
      // eslint-disable-next-line no-console
      if (import.meta.env.DEV) console.debug(`PageRenderer: replaced Promise-like value in props (block=${blockId} path=${path})`)
      return null
    }
    if (Array.isArray(value)) {
      return value.map((v, i) => clean(v, path ? `${path}[${i}]` : `[${i}]`))
    }
    const res = {}
    for (const [k, v] of Object.entries(value)) {
      res[k] = clean(v, path ? `${path}.${k}` : k)
    }
    return res
  }

  return clean(obj, '')
}

// Count thenable/promise-like values in a block's props (non-destructive).
function countThenables(block) {
  try {
    if (!block || !block.props) return 0
    let count = 0
    function walk(v) {
      if (v && typeof v.then === 'function') { count++; return }
      if (Array.isArray(v)) return v.forEach(walk)
      if (v && typeof v === 'object') return Object.values(v).forEach(walk)
    }
    walk(block.props)
    return count
  } catch (e) {
    return 0
  }
}

// Only flip isMounted on the client — keep server output as placeholder to
// avoid any Promise objects leaking into the SSR HTML.
  // If we're in admin mode, ensure setup is called even on the server so that
  // admin-specific behaviour (eg. pre-triggering all blocks) is available in
  // the SSR output. For non-admin mode we defer setup to the client to avoid
  // awaiting async loaders during SSR which previously leaked Promises.
  try {
    if (isAdmin && isAdmin.value) {
      setup(props.blocks || [])
    }
  } catch (e) {}

  if (typeof window !== 'undefined' && import.meta?.client) {
    setTimeout(() => {
      isMounted.value = true
      // Call setup on the client as well to initialize IntersectionObserver etc.
      try { setup(props.blocks || []) } catch (e) {}
    }, 0)
  } else {
    // On server: do not set isMounted, but we may have called setup above for admin.
  }

// Ensure clicks inside complex child components still select the block.
// Some child components may stopPropagation on click; to be robust we add a
// capture-phase listener on `document` that finds the nearest `.block-wrapper`
// and calls selectBlock with its data-block-id. This is only active on the
// client and only when admin mode is enabled.
let docClickHandler, docPointerHandler
if (typeof window !== 'undefined' && import.meta?.client) {
  docClickHandler = (ev) => {
    try {
      if (!isAdmin || !isAdmin.value) return
      const target = ev.target
      if (!target) return
      const wrapper = target.closest && target.closest('.block-wrapper')
      if (wrapper) {
        const bid = wrapper.getAttribute('data-block-id')
        if (bid) {
          try { if (import.meta.env.DEV) console.debug('PageRenderer.docClick: found wrapper', { id: bid }) } catch (e) {}
          try { selectBlock(bid) } catch (e) { console.error('PageRenderer.docClick: selectBlock failed', e) }
          try { if (editingBlockId) editingBlockId.value = bid } catch (e) {}
          try {
            document.querySelectorAll('.block-wrapper.admin-selected').forEach(el => el.classList.remove('admin-selected'))
            wrapper.classList.add('admin-selected')
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('PageRenderer: doc click handler failed', e)
    }
  }

  docPointerHandler = (ev) => {
    try {
      if (!isAdmin || !isAdmin.value) return
      const target = ev.target
      if (!target) return
      const wrapper = target.closest && target.closest('.block-wrapper')
      if (wrapper) {
        const bid = wrapper.getAttribute('data-block-id')
        if (bid) {
          try { if (import.meta.env.DEV) console.debug('PageRenderer.docPointer: found wrapper', { id: bid }) } catch (e) {}
          try { selectBlock(bid) } catch (e) {}
          try { if (editingBlockId) editingBlockId.value = bid } catch (e) {}
          try {
            document.querySelectorAll('.block-wrapper.admin-selected').forEach(el => el.classList.remove('admin-selected'))
            wrapper.classList.add('admin-selected')
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('PageRenderer: doc pointer handler failed', e)
    }
  }
}

onMounted(() => {
  if (docClickHandler && docPointerHandler) {
    document.addEventListener('click', docClickHandler, true)
    document.addEventListener('pointerdown', docPointerHandler, true)
  }
})

onUnmounted(() => {
  if (docClickHandler) document.removeEventListener('click', docClickHandler, true)
  if (docPointerHandler) document.removeEventListener('pointerdown', docPointerHandler, true)
})

// Click wrapper handler that logs and forwards to selectBlock
function wrapperClick(id) {
    try { if (import.meta.env.DEV) console.debug('PageRenderer.wrapperClick: before', { id, editing: editingBlockId?.value }) } catch (e) {}
  try {
    selectBlock(id)
  } catch (e) {
    if (import.meta.env.DEV) console.debug('PageRenderer.wrapperClick: selectBlock threw', e)
  }
    // Fallback: ensure the injected editingBlockId ref is updated even if
    // the provided selectBlock is not wired correctly in some environments.
    try {
      if (editingBlockId && editingBlockId.value !== id) {
        editingBlockId.value = id
      }
    } catch (e) {
      if (import.meta.env.DEV) console.debug('PageRenderer.wrapperClick: failed to set editingBlockId directly', e)
    }
    try { if (import.meta.env.DEV) console.debug('PageRenderer.wrapperClick: after', { id, editing: editingBlockId?.value }) } catch (e) {}
}

function isSelected(block) {
  try {
    // editingBlockId is a ref provided from the admin composable.
    const sel = Boolean(isAdmin && isAdmin.value && editingBlockId && editingBlockId.value === block.id)
    try { if (import.meta.env.DEV) console.debug('PageRenderer.isSelected', { blockId: block.id, editing: editingBlockId?.value, result: sel }) } catch (e) {}
    return sel
  } catch (e) {
    return false
  }
}

// After mount, scan for stray "[object Promise]" text nodes and log their block context
// Only run this on the client — server environments don't have `document`.
if (typeof window !== 'undefined' && import.meta?.client) {
  nextTick().then(() => {
    try {
      // small delay to let hydration finish
      setTimeout(() => {
        const wrappers = Array.from(document.querySelectorAll('.block-wrapper'))
        for (const w of wrappers) {
          for (const node of Array.from(w.childNodes || [])) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.includes('[object Promise]')) {
              // find nearest block id via dataset or fallback
              const bid = w.getAttribute('data-block-id') || w.querySelector('[data-block-id]')?.getAttribute('data-block-id') || 'unknown'
              if (import.meta.env.DEV) console.debug('PageRenderer: found [object Promise] text in wrapper', { blockId: bid, html: w.innerHTML.slice(0,300) })
            }
          }
        }
      }, 50)
    } catch (e) {
      if (import.meta.env.DEV) console.debug('PageRenderer: error in promise-text scanner', e)
    }
  })
}

watch(() => (props.blocks || []).map(b => b.id).join(','), async () => {
  try {
    await nextTick()
    handleBlocksChange(props.blocks || [])
  } catch (err) {
    console.error('PageRenderer: error in blocks watcher', err)
  }
}, { deep: false })

let suppressAnimationWatcher = false
watch(() => fixedBlocks.value.map(b => ({ id: b.id, anim: b.props?.animation })), (newArr) => {
  if (suppressAnimationWatcher) return
  try {
    handleAnimationChange(fixedBlocks.value)
  } catch (err) {
    console.error('PageRenderer: error in animation watcher', err)
  }
}, { deep: false })
</script>

<style scoped>
.page-renderer { width: 100%; }
.admin-selected { outline: 2px solid #3B82F6; outline-offset: -2px; }
.drag-container { width: 100%; }
.drag-handle {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 100;
  cursor: grab;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 18px;
  line-height: 1;
  color: #3B82F6;
  opacity: 0;
  transition: opacity 0.15s;
  user-select: none;
}
.block-wrapper:hover .drag-handle { opacity: 1; }
.drag-handle:active { cursor: grabbing; }
</style>

<style>
.admin-mode .block-wrapper {
  cursor: pointer;
  position: relative;
  transition: outline 0.15s;
}
.admin-mode .block-wrapper:hover {
  outline: 2px dashed rgba(59, 130, 246, 0.5);
  outline-offset: -2px;
}
.admin-mode .block-wrapper.draggable {
  padding-top: 4px;
}
.block-ghost {
  opacity: 0.4;
  outline: 2px dashed #3B82F6;
  outline-offset: -2px;
  background: rgba(59, 130, 246, 0.05);
}
</style>
