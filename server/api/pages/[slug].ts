export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  // Test ou prod : mock ou vrai service
  const { getPageDoc, setPageDoc } = config.TEST_ENV
    ? await import('~/server/utils/firestore-mock.js')
    : await import('~/server/utils/firestore-service.js') // Uses PW_TEST via runtimeConfig, set by Playwright automatically.

  const slug = event.context.params?.slug || getRouterParam(event, 'slug')

  if (event.method === 'GET') {
    return await getPageDoc(slug)
  }
  if (event.method === 'POST') {
    const data = await readBody(event)
    return await setPageDoc(slug, data)
  }

  return { blocks: [] }
})
