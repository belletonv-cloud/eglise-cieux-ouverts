
import { ref, computed } from 'vue'

const toasts = ref([]) // [{msg, type, id}]
const toastMsg = computed(() => toasts.value.length ? toasts.value[0].msg : '')
const toastType = computed(() => toasts.value.length ? toasts.value[0].type : 'toast-success')

let toastId = 0

export function useToast() {
  function showToast(msg, type = 'toast-success') {
    const id = ++toastId
    toasts.value.push({ msg, type, id })
    setTimeout(() => {
      if (toasts.value[0]?.id === id) toasts.value.shift()
    }, 2100)
  }

  return {
    showToast,
    toastMsg,
    toastType,
    toasts
  }
}
