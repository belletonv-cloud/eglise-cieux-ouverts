export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  const { isAdminMode, enterAdmin, exitAdmin } = useAdmin()

  if (route.query.admin === 'true' && import.meta.client) {
    enterAdmin([])
  }

  if (import.meta.client) {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isAdminMode.value) {
        exitAdmin()
      }
    })
  }

  return {
    provide: {
      isAdmin: isAdminMode,
    },
  }
})
