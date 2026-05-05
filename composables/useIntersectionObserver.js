import { onMounted, onUnmounted, ref } from 'vue'

export function useIntersectionObserver(elementRef, options = {}) {
  const isVisible = ref(false)

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      isVisible.value = true
      if (options.addClass) {
        entry.target.classList.add('visible')
      }
      if (options.unobserve) {
        observer.unobserve(entry.target)
      }
    }
  }, {
    threshold: options.threshold || 0.1,
    ...options
  })

  onMounted(() => {
    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      observer.unobserve(elementRef.value)
    }
  })

  return {
    isVisible
  }
}

export function useFadeIn(elementRef) {
  onMounted(() => {
    if(!elementRef.value) return
    
    elementRef.value.classList.add('fade-in-on-scroll')

    useIntersectionObserver(elementRef, {
      addClass: true,
      unobserve: true,
      threshold: 0.2
    })
  })
}
