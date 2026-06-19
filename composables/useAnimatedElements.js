/**
 * Per-block composable to declare animated sub-elements.
 *
 * Usage in a block component:
 *
 *   const { addElement, blockStates } = useAnimatedElements(props.blockId)
 *   const titleAnim = addElement('title', { animation: 'slideUp', delay: 0 })
 *   const ctaAnim   = addElement('cta', { animation: 'bounce', delay: 300 })
 *
 * Template:
 *
 *   <h2 :ref="titleAnim.setRef" :class="[titleAnim.animClass, { triggered: titleAnim.triggered }]">
 *     {{ title }}
 *   </h2>
 *
 * In admin mode, the global animation system shows a replay button
 * next to each registered element's DOM node.
 */
import { ref, inject, computed, onUnmounted } from 'vue'

const ANIM_CONTROLLER_KEY = Symbol('anim-controller')

export function useAnimatedElements(blockId) {
  const controller = inject(ANIM_CONTROLLER_KEY, null)
  const registeredIds = []

  function addElement(elementId, options = {}) {
    if (!blockId || !controller) {
      const dummy = ref(false)
      return {
        key: '',
        triggered: dummy,
        animClass: '',
        setRef: () => {},
      }
    }

    const result = controller.registerElement(blockId, elementId, options)
    registeredIds.push(elementId)

    return {
      key: result.key,
      triggered: result.triggered,
      animClass: result.animClass,
      setRef: result.setRef,
    }
  }

  const blockStates = computed(() => {
    if (!blockId || !controller) return {}
    const states = {}
    for (const id of registeredIds) {
      states[id] = controller.isElementTriggered(blockId, id)
    }
    return states
  })

  onUnmounted(() => {
    if (controller && blockId) {
      controller.unregisterBlock(blockId)
    }
  })

  return { addElement, blockStates }
}
