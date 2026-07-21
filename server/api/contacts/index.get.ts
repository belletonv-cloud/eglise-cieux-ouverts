import { getFirestoreConfig, getAccessToken, listFirestoreCollection, parseFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

// Les messages du formulaire de contact ne sont jamais affichés côté
// visiteur — GET est donc admin-only ici, comme /api/comments.
export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getContacts } = await import('../../utils/firestore-mock.js')
    return { contacts: getContacts() }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    return { contacts: [] }
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const docs = await listFirestoreCollection(config.projectId, accessToken, 'contacts')
    const contacts = (docs || [])
      .map((doc: any) => {
        const data = parseFirestoreDoc(doc)
        if (!data) return null
        return { id: doc.name?.split('/').pop() || '', ...data }
      })
      .filter(Boolean)
    return { contacts }
  } catch (err: any) {
    console.error('List contacts error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors du chargement des messages: ${err.message || err}` })
  }
})
