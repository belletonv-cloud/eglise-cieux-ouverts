// Auto-enable admin mode in E2E (PW_TEST) or with ?admin=true
export default defineNuxtPlugin(() => {
  const { enterAdmin } = useAdmin()

  if (import.meta.client) {
    const isPWTest = typeof window !== 'undefined' && (window.PW_TEST || window.__PW_TEST__ || window.location.search.includes('PW_TEST=1'))
    if (isPWTest || (typeof process !== 'undefined' && process.env?.PW_TEST === '1')) {
      // Bypass auth in enterAdmin for tests:
      enterAdmin([]) // supply dummy blocks array as needed or empty to enable admin
    }
  }
})
