export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const slug = event.context.params?.slug || getRouterParam(event, 'slug')
  const isTest = config.TEST_ENV;
  let getPageDoc, setPageDoc;

  if (isTest) {
    const mock = await import('~/server/utils/firestore-mock.js')
    getPageDoc = mock.getPageDoc;
    setPageDoc = mock.setPageDoc;
  } else {
    const svc = await import('~/server/utils/firestore-service.js');
    getPageDoc = svc.getPageDoc;
    setPageDoc = svc.setPageDoc;
  }

  if (event.method === 'GET') {
    return await getPageDoc(slug)
  }
  if (event.method === 'POST') {
    const data = await readBody(event)
    return await setPageDoc(slug, data)
  }

  return { blocks: [] }
})
