export default defineNuxtPlugin(() => {
  const { isAdminMode, exitAdmin } = useAdmin()

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
