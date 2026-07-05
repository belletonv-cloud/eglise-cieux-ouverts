import { ref, nextTick, provide, watch } from "vue"
import { ANIM_CONTROLLER_KEY } from "./useAnimatedElements"

const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== "undefined" &&
  CSS.supports &&
  CSS.supports("animation-timeline: view()")

const SCROLL_DRIVEN_TYPES = ["aspirations", "nousRejoindre", "rejoins"]
const INTERNAL_TYPES = ["aspirations", "nousRejoindre", "rejoins", "footer"]

function shouldSkipTrigger(type, isAdmin) {
  if (!SUPPORTS_SCROLL_TIMELINE) return false
  if (!SCROLL_DRIVEN_TYPES.includes(type)) return false
  if (isAdmin?.value) return false
  return true
}

// ── Module-level shared state ──
// Element-level registration (new system)
const elementRegistry = new Map() // key -> { blockId, elementId, domRef, animation, delay, stateRef }
const elementTriggers = ref({})   // { [key]: boolean }
// Block-level state (legacy system, kept for backward compat)
const triggeredBlocks = ref([])
const wrapperRefs = ref({})

let lastAnimations = {}
let observer = null
let elementObserver = null
let replayHandler = null
const fallbackObservers = new Map()
let blocksCache = []

// Déclenche les animations par ÉLÉMENT au scroll en mode public (le grand
// IntersectionObserver `observer` ne gère que le niveau bloc/wrapper).
// Nécessaire pour les navigateurs sans animation-timeline CSS.
function createElementObserver(elementRegistryRef, elementTriggersRef) {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const key = entry.target.dataset?.animKey
        try { elementObserver?.unobserve(entry.target) } catch {}
        if (!key) return
        const reg = elementRegistryRef.get(key)
        if (!reg) return
        setTimeout(() => {
          elementTriggersRef.value = { ...elementTriggersRef.value, [key]: true }
          if (reg.stateRef) reg.stateRef.value = true
          if (entry.target.classList && !entry.target.classList.contains('triggered')) {
            entry.target.classList.add('triggered')
          }
        }, reg.delay || 0)
      })
    },
    { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
  )
}

export function useBlockAnimation(isAdmin, isServerAdminRef) {
  // ── Element-level API (new) ──

  function registerElement(blockId, elementId, options = {}) {
    const key = `${blockId}:${elementId}`
    const stateRef = ref(false)

    elementRegistry.set(key, {
      blockId,
      elementId,
      animation: options.animation || 'fadeIn',
      delay: options.delay || 0,
      stateRef,
      domRef: null,
    })

    elementTriggers.value = { ...elementTriggers.value, [key]: false }

    function setRef(el) {
      if (!elementRegistry.has(key)) return
      const entry = elementRegistry.get(key)
      if (!el && entry.domRef) {
        // Démontage : libère l'ancien nœud de l'observer (référence DOM
        // détachée sinon, l'état étant au niveau module)
        try { elementObserver?.unobserve(entry.domRef) } catch {}
      }
      entry.domRef = el
      if (el) {
        el.dataset.animKey = key
        // En public, l'élément est déclenché au scroll ; en admin tout est
        // forcé triggered par setupClient/watch(isAdmin)
        if (elementObserver && !(isAdmin && isAdmin.value) && !elementTriggers.value[key]) {
          try { elementObserver.observe(el) } catch {}
        }
      }
    }

    return {
      key,
      triggered: stateRef,
      setRef,
      animClass: `block-anim-${options.animation || 'fadeIn'}`,
    }
  }

  function unregisterBlock(blockId) {
    for (const [key, entry] of elementRegistry) {
      if (entry.blockId === blockId) {
        elementRegistry.delete(key)
      }
    }
    const next = {}
    for (const [k, v] of Object.entries(elementTriggers.value)) {
      if (!k.startsWith(`${blockId}:`)) next[k] = v
    }
    elementTriggers.value = next
  }

  function triggerElement(blockId, elementId) {
    const key = `${blockId}:${elementId}`
    const prev = elementTriggers.value[key]
    if (prev) return
    elementTriggers.value = { ...elementTriggers.value, [key]: true }
    const entry = elementRegistry.get(key)
    if (entry?.stateRef) entry.stateRef.value = true
  }

  function isElementTriggered(blockId, elementId) {
    const key = `${blockId}:${elementId}`
    return elementTriggers.value[key] || false
  }

  function replayElement(blockId, elementId) {
    const key = `${blockId}:${elementId}`
    const entry = elementRegistry.get(key)
    if (!entry) return

    // Remove triggered
    elementTriggers.value = { ...elementTriggers.value, [key]: false }
    if (entry.stateRef) entry.stateRef.value = false

    const el = entry.domRef
    if (el && el.classList) {
      el.classList.remove('triggered')
      void el.offsetHeight
    }

    // Re-observe if needed (public mode)
    if (observer && el) {
      try { observer.unobserve(el) } catch {}
      try { observer.observe(el) } catch {}
    }

    if (isAdmin && isAdmin.value) {
      setTimeout(() => {
        elementTriggers.value = { ...elementTriggers.value, [key]: true }
        if (entry.stateRef) entry.stateRef.value = true
        if (el && el.classList) el.classList.add('triggered')
      }, 50)
    } else {
      try { el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch {}
    }
  }

  // Provide the animation controller so blocks can register elements
  provide(ANIM_CONTROLLER_KEY, {
    registerElement,
    unregisterBlock,
    isElementTriggered,
    triggerElement,
    replayElement,
  })

  // ── Legacy block-level API (kept for backward compat) ──

  function isTriggered(id) {
    return triggeredBlocks.value.includes(id)
  }

  function setWrapperRef(el, id) {
    if (el) {
      wrapperRefs.value[id] = el
    } else if (wrapperRefs.value[id]) {
      // Démontage : Vue rappelle la ref avec null. wrapperRefs est un état
      // de MODULE qui survit aux navigations — sans purge, on accumule des
      // nœuds DOM détachés sur lesquels observeElements/replay continuent
      // d'opérer (observer.observe, classList…) après changement de page.
      const stale = wrapperRefs.value[id]
      try { observer?.unobserve(stale) } catch {}
      const fbObserver = fallbackObservers.get(id)
      if (fbObserver) {
        try { fbObserver.disconnect() } catch {}
        fallbackObservers.delete(id)
      }
      delete wrapperRefs.value[id]
    }
  }

  function observeElements() {
    if (!observer) return
    for (const [id, el] of Object.entries(wrapperRefs.value)) {
      if (el) {
        if (SUPPORTS_SCROLL_TIMELINE) {
          const block = (blocksCache || []).find((b) => b.id === id)
          if (block && SCROLL_DRIVEN_TYPES.includes(block.type)) continue
        }
        el.dataset.blockId = id
        observer.observe(el)
      }
    }
  }

  function initAdminTrigger(blocks) {
    const allIds = (blocks || [])
      .filter((b) => !shouldSkipTrigger(b.type, isAdmin))
      .map((b) => b.id)
      .filter(Boolean)
    triggeredBlocks.value = [...allIds]

    // Also trigger all registered elements for visible blocks in admin
    for (const [key, entry] of elementRegistry) {
      elementTriggers.value = { ...elementTriggers.value, [key]: true }
      if (entry.stateRef) entry.stateRef.value = true
    }
  }

  function setupFallbackObservers(blocks) {
    if (SUPPORTS_SCROLL_TIMELINE) return
    for (const block of blocks || []) {
      if (INTERNAL_TYPES.includes(block.type)) {
        const el = wrapperRefs.value[block.id]
        if (el && !fallbackObservers.has(block.id)) {
          const fbObserver = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('triggered')
                if (!triggeredBlocks.value.includes(block.id)) {
                  triggeredBlocks.value = [...triggeredBlocks.value, block.id]
                }
                fbObserver.unobserve(entry.target)
              }
            },
            { threshold: 0.1 },
          )
          fbObserver.observe(el)
          fallbackObservers.set(block.id, fbObserver)
        }
      }
    }
  }

  function replayBlockAnimation(id) {
    const el = wrapperRefs.value[id]
    const block = blocksCache.find((b) => b.id === id)

    // New system: if block has registered elements, replay them all
    const blockElements = []
    for (const [key, entry] of elementRegistry) {
      if (entry.blockId === id) blockElements.push(entry)
    }

    if (blockElements.length > 0) {
      for (const entry of blockElements) {
        const key = `${entry.blockId}:${entry.elementId}`
        elementTriggers.value = { ...elementTriggers.value, [key]: false }
        if (entry.stateRef) entry.stateRef.value = false
        if (entry.domRef?.classList) {
          entry.domRef.classList.remove('triggered')
          void entry.domRef.offsetHeight
        }
      }
      if (isAdmin && isAdmin.value) {
        setTimeout(() => {
          for (const entry of blockElements) {
            const key = `${entry.blockId}:${entry.elementId}`
            elementTriggers.value = { ...elementTriggers.value, [key]: true }
            if (entry.stateRef) entry.stateRef.value = true
            if (entry.domRef?.classList) entry.domRef.classList.add('triggered')
          }
        }, 50)
      } else {
        try { el?.scrollIntoView({ block: 'center' }) } catch {}
      }
      return
    }

    // Legacy: internal animations
    if (INTERNAL_TYPES.includes(block?.type)) {
      triggeredBlocks.value = triggeredBlocks.value.filter((item) => item !== id)
      if (el && el.classList) {
        el.classList.remove('triggered')
        void el.offsetHeight
      }
      if (!SUPPORTS_SCROLL_TIMELINE) {
        const fbObserver = fallbackObservers.get(id)
        if (fbObserver && el) fbObserver.observe(el)
      }
      if (isAdmin && isAdmin.value) {
        setTimeout(() => {
          if (el && !el.classList.contains('triggered')) el.classList.add('triggered')
          triggeredBlocks.value = [...(triggeredBlocks.value || []), id]
        }, 50)
        return
      }
      try { el?.scrollIntoView({ block: 'center' }) } catch {}
      return
    }

    // Legacy: wrapper animations
    triggeredBlocks.value = triggeredBlocks.value.filter((item) => item !== id)
    if (el && el.classList) {
      const animClasses = Array.from(el.classList).filter((c) => c.startsWith('block-anim-'))
      animClasses.forEach((c) => el.classList.remove(c))
      void el.offsetHeight
      animClasses.forEach((c) => el.classList.add(c))
    }
    if (el && observer) {
      try { observer.unobserve(el) } catch {}
      try { observer.observe(el) } catch {}
    }
    if (isAdmin && isAdmin.value) {
      setTimeout(() => { triggeredBlocks.value = [...(triggeredBlocks.value || []), id] }, 40)
    } else {
      try { el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch {}
    }
  }

  function isInIframe() {
    return typeof window !== 'undefined' && window.top !== window.self
  }

  function setup(blocks) {
    blocksCache = blocks || []
    if (import.meta.server) {
      // triggeredBlocks est un état de module PARTAGÉ entre les requêtes SSR
      // du process Node : sans reset, un rendu ?admin=true (tout déclenché)
      // pollue les rendus publics suivants → hydration mismatch chez tous
      // les visiteurs
      triggeredBlocks.value = (isAdmin.value || isServerAdminRef?.value)
        ? (blocks || []).filter((b) => !shouldSkipTrigger(b.type, isAdmin)).map((b) => b.id).filter(Boolean)
        : []
      return
    }
    if (isAdmin.value || isServerAdminRef?.value) {
      initAdminTrigger(blocks)
      return
    }
    if (isInIframe()) {
      const allIds = (blocks || []).map((b) => b.id).filter(Boolean)
      triggeredBlocks.value = [...allIds]
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset?.blockId
            if (id) {
              if (SUPPORTS_SCROLL_TIMELINE) {
                const block = (blocksCache || []).find((b) => b.id === id)
                if (block && SCROLL_DRIVEN_TYPES.includes(block.type)) return
              }
              triggeredBlocks.value = [...triggeredBlocks.value, id]
              observer.unobserve(entry.target)
            }
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
    )
    if (!elementObserver) {
      elementObserver = createElementObserver(elementRegistry, elementTriggers)
    }
  }

  function handleBlocksChange(blocks) {
    if (isInIframe()) {
      const allIds = (blocks || []).map((b) => b.id).filter(Boolean)
      triggeredBlocks.value = [...allIds]
      return
    }
    if (isAdmin.value) {
      const allIds = (blocks || [])
        .filter((b) => !shouldSkipTrigger(b.type, isAdmin))
        .map((b) => b.id)
        .filter(Boolean)
      triggeredBlocks.value = [...allIds]
      return
    }
    observeElements()
    setupFallbackObservers(blocks)
  }

  function handleAnimationChange(fixedBlocks) {
    const oldMap = lastAnimations || {}
    const newMap = {}
    for (const b of fixedBlocks) {
      newMap[b.id] = b.props?.animation
      const prev = oldMap[b.id]
      const now = b.props?.animation
      if (prev !== undefined && prev !== now) {
        triggeredBlocks.value = triggeredBlocks.value.filter((item) => item !== b.id)
        const el = wrapperRefs.value[b.id]
        if (el && el.classList) {
          el.classList.remove(`block-anim-${prev}`, 'triggered')
          void el.offsetHeight
          el.classList.add(`block-anim-${now}`)
        }
        if (el && observer) {
          try { observer.observe(el) } catch (e) { console.error(e) }
        }
        if (isAdmin && isAdmin.value) {
          setTimeout(() => { triggeredBlocks.value = [...(triggeredBlocks.value || []), b.id] }, 40)
        }
      }
    }
    lastAnimations = newMap
  }

  function setupClient() {
    const isCurrentlyAdmin = () => {
      if (typeof window === 'undefined') return false
      return new URLSearchParams(window.location.search).get('admin') === 'true'
    }

    if (isInIframe()) {
      const allIds = (blocksCache || []).map((b) => b.id).filter(Boolean)
      triggeredBlocks.value = [...allIds]
      for (const id of allIds) {
        document.querySelectorAll(`[data-block-id="${id}"]`).forEach((el) => {
          if (el && !el.classList.contains('triggered')) el.classList.add('triggered')
        })
      }
      return
    }

    if (isCurrentlyAdmin() || (isAdmin && isAdmin.value)) {
      // Delay triggering so CSS transitions fire (elements need to render first)
      setTimeout(() => {
        const allIds = (blocksCache || [])
          .filter((b) => !shouldSkipTrigger(b.type, isAdmin))
          .map((b) => b.id)
          .filter(Boolean)
        triggeredBlocks.value = [...allIds]
        for (const id of allIds) {
          document.querySelectorAll(`[data-block-id="${id}"]`).forEach((el) => {
            if (el && !el.classList.contains('triggered')) el.classList.add('triggered')
          })
        }
        // Element-level: trigger all registered elements
        for (const [key, entry] of elementRegistry) {
          elementTriggers.value = { ...elementTriggers.value, [key]: true }
          if (entry.stateRef) entry.stateRef.value = true
          if (entry.domRef?.classList && !entry.domRef.classList.contains('triggered')) {
            entry.domRef.classList.add('triggered')
          }
        }
      }, 100)
      // Retry for late-registering elements
      let attempts = 0
      const intervalId = setInterval(() => {
        for (const [key, entry] of elementRegistry) {
          if (!elementTriggers.value[key]) {
            elementTriggers.value = { ...elementTriggers.value, [key]: true }
            if (entry.stateRef) entry.stateRef.value = true
            if (entry.domRef?.classList && !entry.domRef.classList.contains('triggered')) {
              entry.domRef.classList.add('triggered')
            }
          }
        }
        attempts++
        if (attempts >= 10) clearInterval(intervalId)
      }, 100)
    }

    // Public mode — always set up observer for mixed admin/public scenarios
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.dataset?.blockId
              if (id) {
                if (SUPPORTS_SCROLL_TIMELINE) {
                  const block = (blocksCache || []).find((b) => b.id === id)
                  if (block && SCROLL_DRIVEN_TYPES.includes(block.type)) return
                }
                triggeredBlocks.value = [...triggeredBlocks.value, id]
                observer.unobserve(entry.target)
              }
            }
          })
        },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
      )
    }
    if (!elementObserver) {
      elementObserver = createElementObserver(elementRegistry, elementTriggers)
      // Les setRef déjà passés n'ont pas pu observer : rattrapage (public)
      if (!(isAdmin && isAdmin.value) && !isCurrentlyAdmin()) {
        for (const [key, entry] of elementRegistry) {
          if (entry.domRef && !elementTriggers.value[key]) {
            try { elementObserver.observe(entry.domRef) } catch {}
          }
        }
      }
    }
    nextTick(() => {
      observeElements()
      setupFallbackObservers(blocksCache)
      setTimeout(() => {
        for (const [id, el] of Object.entries(wrapperRefs.value)) {
          if (el && observer) {
            if (SUPPORTS_SCROLL_TIMELINE) {
              const block = (blocksCache || []).find((b) => b.id === id)
              if (block && SCROLL_DRIVEN_TYPES.includes(block.type)) continue
            }
            const rect = el.getBoundingClientRect()
            if (rect.top < window.innerHeight * 0.9) {
              if (!triggeredBlocks.value.includes(id)) {
                triggeredBlocks.value = [...triggeredBlocks.value, id]
                observer.unobserve(el)
              }
            }
          }
        }
      }, 100)
    })

    // ── Event listeners for both admin and public modes ──

    replayHandler = (e) => {
      const id = e?.detail?.id
      if (!id) return
      replayBlockAnimation(id)
    }
    document.addEventListener('replay-animation', replayHandler)

    // Element-level replay handler
    const elementReplayHandler = (e) => {
      const { blockId, elementId } = e?.detail || {}
      if (blockId && elementId) replayElement(blockId, elementId)
    }
    document.addEventListener('replay-element-animation', elementReplayHandler)

    // Cleanup element replay listener on teardown
    const origTeardown = typeof teardownClient === 'function' ? teardownClient : () => {}
    teardownClient = () => {
      origTeardown()
      document.removeEventListener('replay-element-animation', elementReplayHandler)
    }
  }

  function teardownClient() {
    if (observer) observer.disconnect()
    if (elementObserver) elementObserver.disconnect()
    if (replayHandler) document.removeEventListener('replay-animation', replayHandler)
    for (const [, obs] of fallbackObservers) obs.disconnect()
    fallbackObservers.clear()
  }

  // When admin mode activates after mount (async auth), re-trigger
  let watchedOnce = false
  watch(isAdmin, (val) => {
    if (val && blocksCache) {
      initAdminTrigger(blocksCache)
      // Also trigger element-level registry if it has entries now
      if (elementRegistry.size > 0) {
        for (const [key, entry] of elementRegistry) {
          elementTriggers.value = { ...elementTriggers.value, [key]: true }
          if (entry.stateRef) entry.stateRef.value = true
          if (entry.domRef?.classList && !entry.domRef.classList.contains('triggered')) {
            entry.domRef.classList.add('triggered')
          }
        }
      }
    }
    if (!watchedOnce) {
      watchedOnce = true
    }
  })

  return {
    triggeredBlocks, wrapperRefs,
    isTriggered, setWrapperRef,
    setup, handleBlocksChange, handleAnimationChange,
    initAdminTrigger, observeElements,
    setupClient, teardownClient,
    // Element-level API
    registerElement, unregisterBlock,
    isElementTriggered, triggerElement, replayElement,
  }
}
