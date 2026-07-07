import { getFirestoreConfig, getAccessToken, listFirestoreCollection, parseFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

// Contrairement à pages/index.get.ts (public, nécessaire au rendu du site),
// les demandes développeur ne sont jamais affichées côté visiteur — GET est
// donc admin-only ici, y compris en mode réel.
export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getComments } = await import('../../utils/firestore-mock.js')
    return { comments: getComments() }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    return { comments: [] }
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const docs = await listFirestoreCollection(config.projectId, accessToken, 'comments')
    const comments = (docs || [])
      .map((doc: any) => {
        const data = parseFirestoreDoc(doc)
        if (!data) return null
        return { id: doc.name?.split('/').pop() || '', ...data }
      })
      .filter(Boolean)
    return { comments }
  } catch (err: any) {
    console.error('List comments error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors du chargement des demandes: ${err.message || err}` })
  }
})
