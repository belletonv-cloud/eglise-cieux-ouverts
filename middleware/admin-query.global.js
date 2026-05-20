export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.client && to.query.admin !== 'true') {
    const { isAdminMode } = useAdmin()
    if (isAdminMode.value) {
      return navigateTo({ path: to.path, query: { ...to.query, admin: 'true' } }, { redirectCode: 302 })
    }
  }
})
