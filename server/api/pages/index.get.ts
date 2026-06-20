import { getFirestoreConfig, getAccessToken, listFirestoreCollection, parseFirestoreDoc } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    return { pages: [] }
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const docs = await listFirestoreCollection(config.projectId, accessToken, 'pages')
    const pages = (docs || [])
      .map((doc: any) => {
        const data = parseFirestoreDoc(doc)
        if (!data) return null
        return {
          slug: doc.name?.split('/').pop() || '',
          title: data.title || data.slug || doc.name?.split('/').pop() || '',
          updatedAt: data.updatedAt || null,
          updatedBy: data.updatedBy || null,
          blockCount: data.blocks?.length || 0,
          _deleted: data._deleted || false,
        }
      })
      .filter(Boolean)
    return { pages }
  } catch (err: any) {
    console.error('List pages error:', err)
    return { pages: [] }
  }
})
