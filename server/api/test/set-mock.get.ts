import { defineEventHandler, getQuery } from 'h3'
import { setPageDoc, resetMock } from '../../utils/firestore-mock.js'

export default defineEventHandler(async (event) => {
  if (import.meta.dev === false) {
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