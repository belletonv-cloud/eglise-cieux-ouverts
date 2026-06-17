export default defineNuxtPlugin(() => {
  const { isAdminMode } = useAdmin()

  return {
    provide: {
      isAdmin: isAdminMode,
    },
  }
})
