import { ref, onMounted, onUnmounted } from 'vue'

const SUPPORTS_SCROLL_TIMELINE = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: view()')

export function useBlockAnimation(isAdmin) {
  const triggeredBlocks = ref(new Set())
  const wrapperRefs = ref({})
  const lastAnimations = ref({})
  let observer = null
  let replayHandler = null
  const fallbackObservers = new Map()

  function isTriggered(id) {
    return triggeredBlocks.value.has(id)
  }

  function setWrapperRef(el, id) {
    if (el) wrapperRefs.value[id] = el
  }

  function observeElements() {
    if (!observer) return
    for (const [id, el] of Object.entries(wrapperRefs.value)) {
      if (el) {
        el.dataset.blockId = id
        observer.observe(el)
      }
    }
  }

  function initAdminTrigger(blocks) {
    const allIds = (blocks || []).map(b => b.id).filter(Boolean)
    triggeredBlocks.value = new Set(allIds)
  }

  function setupFallbackObservers(blocks) {
    if (SUPPORTS_SCROLL_TIMELINE) return
    const internalTypes = ['aspirations', 'bienvenue', 'nousRejoindre']
    for (const block of blocks || []) {
      if (internalTypes.includes(block.type)) {
        const el = wrapperRefs.value[block.id]
        if (el && !fallbackObservers.has(block.id)) {
          const fbObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('triggered')
              fbObserver.unobserve(entry.target)
            }
          }, { threshold: 0.1 })
          fbObserver.observe(el)
          fallbackObservers.set(block.id, fbObserver)
        }
      }
    }
  }

  function replayBlockAnimation(id) {
    const el = wrapperRefs.value[id]
    triggeredBlocks.value.delete(id)
    if (el && el.classList) {
      const animClasses = Array.from(el.classList).filter(c => c.startsWith('block-anim-'))
      animClasses.forEach(c => el.classList.remove(c))
      void el.offsetHeight
      animClasses.forEach(c => el.classList.add(c))
    }
    if (el && observer) {
      try { observer.unobserve(el) } catch (err) {}
      try { observer.observe(el) } catch (err) {}
    }
    if (isAdmin && isAdmin.value) {
      setTimeout(() => {
        triggeredBlocks.value = new Set([...(triggeredBlocks.value || []), id])
      }, 40)
    } else {
      try { el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch (err) {}
    }
  }

  function setup(blocks) {
    if (isAdmin.value) {
      initAdminTrigger(blocks)
      return
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.blockId
          if (id) {
            triggeredBlocks.value = new Set([...triggeredBlocks.value, id])
            observer.unobserve(entry.target)
          }
        }
      })
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' })

    onMounted(() => {
      observeElements()
      setupFallbackObservers(blocks)
      lastAnimations.value = Object.fromEntries((blocks || []).map(b => [b.id, b.props?.animation]))

      replayHandler = (e) => {
        const id = e?.detail?.id
        if (!id) return
        replayBlockAnimation(id)
      }
      document.addEventListener('replay-animation', replayHandler)
    })

    onUnmounted(() => {
      if (observer) observer.disconnect()
      if (replayHandler) document.removeEventListener('replay-animation', replayHandler)
      for (const [, obs] of fallbackObservers) obs.disconnect()
      fallbackObservers.clear()
    })
  }

  function handleBlocksChange(blocks) {
    if (isAdmin.value) {
      const allIds = (blocks || []).map(b => b.id).filter(Boolean)
      triggeredBlocks.value = new Set(allIds)
      return
    }
    observeElements()
    setupFallbackObservers(blocks)
  }

  function handleAnimationChange(fixedBlocks) {
    const oldMap = lastAnimations.value || {}
    const newMap = {}
    for (const b of fixedBlocks) {
      newMap[b.id] = b.props?.animation
      const prev = oldMap[b.id]
      const now = b.props?.animation
      if (prev !== undefined && prev !== now) {
        triggeredBlocks.value.delete(b.id)
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
          setTimeout(() => {
            triggeredBlocks.value = new Set([...(triggeredBlocks.value || []), b.id])
          }, 40)
        }
      }
    }
    lastAnimations.value = newMap
  }

  return {
    triggeredBlocks,
    wrapperRefs,
    isTriggered,
    setWrapperRef,
    setup,
    handleBlocksChange,
    handleAnimationChange,
    initAdminTrigger,
    observeElements,
  }
}
