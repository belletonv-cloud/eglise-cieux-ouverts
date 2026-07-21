import { defineEventHandler, getQuery } from 'h3'
import { setPageDoc, resetMock } from '../../utils/firestore-mock.js'

export default defineEventHandler(async (event) => {
  // Même garde que /api/reset-mock : autorisé en dev et sur le serveur
  // buildé lancé par Playwright (PW_TEST=1). Sans ça, cet endpoint 404
  // systématiquement en E2E et les tests qui l'appellent (ex.
  // event-list-fallback.spec.ts) trouvent le mock non vidé.
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (import.meta.dev === false && !isTest) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }
  const query = getQuery(event)
  const slug = query.slug?.toString() || 'event-list'

  if (query.empty === 'true') {
    await setPageDoc(slug, { blocks: [] })
  } else {
    resetMock()
  }

  return { success: true, slug, empty: query.empty === 'true' }
})