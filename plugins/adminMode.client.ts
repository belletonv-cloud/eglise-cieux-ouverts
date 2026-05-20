export default defineNuxtPlugin(() => {
  const { isAdminMode } = useAdmin()

  if (import.meta.client) {
    // Force the admin-mode class on #app-root as a fallback
    // This works around SSR hydration mismatches caused by
    // module-level state in composables/useAdmin.js
    const applyClass = () => {
      const root = document.getElementById('app-root') || document.getElementById('__nuxt')
      if (root) {
        root.classList.toggle('admin-mode', isAdminMode.value)
      }
    }

    // Apply immediately on plugin init
    applyClass()

    // Watch for changes
    watch(isAdminMode, applyClass)
  }
})
