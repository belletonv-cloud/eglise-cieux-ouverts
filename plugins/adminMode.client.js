export default defineNuxtPlugin((nuxtApp) => {
  const { isAdminMode } = useAdmin()

  if (process.client) {
    const applyClass = () => {
      const root = document.getElementById('app-root') || document.getElementById('__nuxt')
      if (root) {
        root.classList.toggle('admin-mode', isAdminMode.value)
      }
    }

    applyClass()
    watch(isAdminMode, applyClass)
  }
})
