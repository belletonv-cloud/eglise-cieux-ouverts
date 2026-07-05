import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../utils/firebase'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }
  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'menu')
    if (!doc) return { menuItems: null, menuBgImage: '' }
    const data = parseFirestoreDoc(doc)
    return { menuItems: data?.menuItems || null, menuBgImage: data?.menuBgImage || '' }
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erreur chargement menu: ${err.message || err}` })
  }
})
