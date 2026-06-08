// Auto-enable admin mode in E2E (PW_TEST)
// Only activates when ?admin=true is present in the URL.
export default defineNuxtPlugin(() => {
  const { isAdminMode, enterAdmin } = useAdmin()

  if (import.meta.client) {
    const isPWTest = typeof window !== 'undefined' && (window.PW_TEST || window.__PW_TEST__ || window.location.search.includes('PW_TEST=1'))
    const hasAdminParam = typeof window !== 'undefined' && window.location.search.includes('admin=true')
    if ((isPWTest || (typeof process !== 'undefined' && process.env?.PW_TEST === '1')) && hasAdminParam) {
      enterAdmin([])
    }
  }
})
