let firestoreCache = {}

export default defineEventHandler(() => {
  firestoreCache = {} // reset all mock data (called from Playwright afterEach)
  return {
    ok: true,
    message: 'Firestore mock reset successfully',
  }
})

// Export for import in firestore-mock.js if needed
export function _getMockCache() {
  return firestoreCache
}
export function _setMockCache(cache) {
  firestoreCache = cache
}
