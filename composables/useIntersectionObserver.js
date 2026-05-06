import { onMounted, onUnmounted, ref } from 'vue'

export function useIntersectionObserver(elementRef, options = {}) {
  const isVisible = ref(false)
  let observer

  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        if (options.addClass) {
          entry.target.classList.add('visible')
        }
        if (options.onIntersect) {
          options.onIntersect()
        }
        if (options.unobserve) {
          observer.unobserve(entry.target)
        }
      }
    }, {
      root: options.root || null,
      threshold: options.threshold || 0.1,
      ...options
    })

    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  })

  onUnmounted(() => {
    if (observer && elementRef.value) {
      observer.unobserve(elementRef.value)
    }
  })

  return {
    isVisible
  }
}

export function useFadeIn(elementRef) {
  onMounted(() => {
    if (!elementRef.value) return
    elementRef.value.classList.add('fade-in-on-scroll')
  })

  useIntersectionObserver(elementRef, {
    addClass: true,
    unobserve: true,
    threshold: 0.2
  })
}
